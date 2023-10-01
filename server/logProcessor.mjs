import fs from 'node:fs'
import readline from 'node:readline'
import { EventEmitter } from 'eventemitter3'
import Debug from 'debug'
import chokidar from 'chokidar'
import { resolveEnvVariablesInPath, capitalize } from './util.mjs'
import { levels } from './syslog.mjs'
import rules from './rules/rules.mjs'
import EventCache from './eventCache.mjs'

const dbg_fw = Debug('fw')

const levelMap = {
  'ALERT': 'alert',
  'ERROR': 'error',
  'WARN': 'warning',
  'INFO': 'info',
  'DEBUG': 'debug'
}

/**
 * LogProcessor class for watching and processing log files.
 * It extends EventEmitter to emit events for specific log patterns.
 *
 * Emits two types of events:
 * - 'eventData': Emitted when a log event matches a pattern.
 *               Event object has the format: {
 *                 eventName: string,
 *                 data: RegExpMatchArray,
 *                 timestamp: Date,
 *                 logLevel: string
 *               }
 * - 'error': Emitted when an error occurs.
 *            Event object has the format: { message: string }
 */
class LogProcessor extends EventEmitter {
  #config
  #filePath
  #atStartBuildEventCacheOnly
  #lastPositionProcessed = 0
  #buffer = ''
  #watcher
  #overlappingGoBackNPositions
  #nextStartPosition = 0
  #isReading = false
  #shouldReadAgain = false
  #eventCache = new EventCache()
  #progressLogging = {}
// Cache for storing precompiled RegExp objects
  #formatCache = new Map()

  /**
   * Constructs a new LogProcessor object.
   *
   * @param {Object} config - Configuration object
   * @param {string} config.logFile - Path to the log file to be processed
   * @param {Object} [config.debug] - Debugging settings
   * @param {boolean} [config.debug.atStartBuildEventCacheOnly=true] - Whether to build the event cache only at start
   * @param {number} [config.debug.overlappingGoBackNPositions=20000] - Number of positions to go back to ensure buffer overlapping
   */
  constructor(config) {
    super()
    this.#config = config
    this.#filePath = resolveEnvVariablesInPath(config.logFile)
    this.#atStartBuildEventCacheOnly= config.debug?.atStartBuildEventCacheOnly ?? true
    this.#overlappingGoBackNPositions = config.debug?.overlappingGoBackNPositions ?? 20000
  }

  /**
   * Precompiles and caches regular expressions based on a set of rules.
   *
   * This function takes the 'pattern' from each rule, escapes any special
   * regex characters, then compiles a new RegExp object which is cached
   * for later use.
   *
   * @param {Array<Object>} rules - The rules containing patterns to be cached.
   * @example
   * // Suppose rules = [{ pattern: 'myPattern{1:uptoHyphen}' }]
   * buildFormatCache(rules)
   * // This would compile and cache a RegExp based on 'myPattern{1:uptoHyphen}'
   */
  #buildFormatCache() {
    /**
     * Get enabled rules based on a precedence of configurations.
     *
     * Logic Description:
     * - Start with defaultRules where disabled is false by default.
     * - Overwrite with rules in config.overwriteRules.
     * - If a rule is marked as disabled: true in all enabled transports, set it to disabled: true.
     * - If a rule is marked as disabled: false in any enabled transport, set it to disabled: false.
     *
     * @param {Array<Object>} defaultRules - Array of default rules
     * @param {Object} config - Configuration object
     * @returns {Array<Object>} - Array of enabled rules
     */
    const getEnabledRules = (defaultRules, config) => {
      const ruleMap = new Map()

      // Initialize ruleMap with defaultRules (disabled is false by default)
      defaultRules.forEach(rule => {
        ruleMap.set(rule.eventName, { ...rule, disabled: rule.disabled || false })
      })

      // Variables to track the disabled state across transports
      const transportEnableCount = {}
      const transportDisableCount = {}
      let transportCount = 0

      // Update ruleMap with rules from enabled transports in config
      config.transports.forEach(transport => {
        if (transport.disabled) return

        transportCount += 1

        transport.overwriteRules?.forEach(overwriteRule => {
          if (overwriteRule.activation === 'active') {
            transportEnableCount[overwriteRule.eventName] = (transportEnableCount[overwriteRule.eventName] || 0) + 1
          }

          if (overwriteRule.activation === 'inactive') {
            transportDisableCount[overwriteRule.eventName] = (transportDisableCount[overwriteRule.eventName] || 0) + 1
          }
        })
      })

      config.overwriteRules?.forEach(overwriteRule => {
        if (overwriteRule.activation === 'active') {
          ruleMap.set(overwriteRule.eventName, { ...overwriteRule, isActive: true })
        }

        if (overwriteRule.activation === 'inactive') {
          ruleMap.set(overwriteRule.eventName, { ...overwriteRule, isActive: false })
        }

        if (transportDisableCount[overwriteRule.eventName] === transportCount) {
          ruleMap.set(overwriteRule.eventName, { ...overwriteRule, isActive: false })
        }

        if (overwriteRule.eventName in transportEnableCount && transportEnableCount[overwriteRule.eventName] > 0) {
          ruleMap.set(overwriteRule.eventName, { ...overwriteRule, isActive: true })
        }
      })

      // Filter and return active rules
      return [...ruleMap.values()].filter(rule => rule.isActive)
    }

    const enabledRules = getEnabledRules(rules, this.#config)
    enabledRules.forEach((rule) => {
      const pattern = rule.pattern

      // Escape any special regex characters in the pattern
      const escapedPattern = pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

      // Initialize format with escaped pattern enclosed by [\s\S]*
      let format = `[\\s\\S]*${escapedPattern}[\\s\\S]*`

      // Replace each placeholder in the escaped pattern with the corresponding regex
      format = format.replace(/\\\{(\d+)(?::(\w+))?\\\}/g, (match, index, specifier) => {
        // Check if we are at the last placeholder in the pattern
        const isLastPlaceholder = escapedPattern.endsWith(match)

        // If the specifier is 'uptoHyphen', use a specific regex pattern
        if (specifier === 'uptoHyphen') {
          return '([^\\-]+)(?:-[^,]+)?'
        }

        // Use a greedy capture (.+) only if it's the last placeholder and at the end of the pattern
        return isLastPlaceholder ? '(.+)' : '(.+?)'
      })

      // Create a new RegExp object with the generated format
      const re = new RegExp(format, 'm')
      this.#formatCache.set(pattern, re)
    })
  }

  /**
   * Extracts the date, level, thread name, and logger from a given log line,
   * transforms the date into a Date object, and maps the level to a corresponding value.
   *
   * @param {string} line - The log line to be parsed.
   * @returns {Object} An object containing the extracted Date object, mapped level,
   *                   thread name, and logger.
   *
   * @example
   * const result = extractTimestampAndLevel("Sep-26 15:53:03.480 [PersistenceManager-read-MyBlindVoteList] INFO  b.c.p.PersistenceManager: Reading MyBlindVoteList completed in 12 ms")
   * console.log(result) // { timestamp: Date object, level: 'info', thread: 'PersistenceManager-read-MyBlindVoteList', logger: 'b.c.p.PersistenceManager' }
   */
  #extractLogEventMetadata(line) {
    const regex = /^(\w+-\d+ \d+:\d+:\d+\.\d+) \[(.*?)\] (\w+)  (.*?):/
    const match = line.match(regex)

    if (!match) {
      return { timestamp: null, level: null, thread: null, logger: null }
    }

    const logDateStr = match[1]
    const currentYear = new Date().getFullYear()
    const parsedDate = new Date(`${logDateStr} ${currentYear}`)

    // Check if the parsed date is in the future.
    if (parsedDate > new Date()) {
      // If it's in the future, then it probably belongs to the previous year.
      parsedDate.setFullYear(parsedDate.getFullYear() - 1)
    }

    const thread = match[2]
    const level = levelMap[match[3]] || 'unknown'
    const logger = match[4]

    return { timestamp: parsedDate, thread, level, logger }
  }

  /**
   * Emits a system event message.
   *
   * @param {Object} params - Parameters for the system message
   * @param {string} params.level - The log level of the system message
   * @param {string} params.message - The message to emit
   */
  #emitSystemMessage({ level, message }) {
    this.emit('eventData', { timestamp: new Date(), eventName: `system${capitalize(level)}`, logLevel: level, data: [level, message] })
  }

  #logProgress({ fileSize, line }) {
    if (fileSize) {
      this.#progressLogging = {
        fileSize,
        lastLoggedProgress: 0,
        bytesRead: 0,
      }
    }
    
    if (line) {
      this.#progressLogging.bytesRead += Buffer.from(line).length + 1  // Add 1 for the newline character
      const progress = (this.#progressLogging.bytesRead / this.#progressLogging.fileSize) * 100

      if (Math.floor(progress / 10) > this.#progressLogging.lastLoggedProgress) {
        this.#emitSystemMessage({ level: levels.debug, message: `logProcessor: Reading the logfile at start... ${Math.floor(progress)}%` })
        this.#progressLogging.lastLoggedProgress = Math.floor(progress / 10)
      }
    }
  }

  /**
   * Matches a pattern within a log event and returns an array of captured values.
   *
   * @param {string} pattern - The pattern to match, e.g. "id={0}, state={1}".
   * @param {string} logEvent - The log event to search in.
   * @returns {Array} - An array of captured values based on the pattern.
   *
   * @example
   * const pattern = 'id={0:uptoHyphen}, state={1}';
   * const logEvent = 'We got a new id=o9OKUJa-123456, state=active';
   * const result = matchPatternInLogEvent(pattern, logEvent);
   * // result will be ['o9OKUJa', 'active']
   */
  #matchPatternInLogEvent(pattern, logEvent) {
    // Get the RegExp object for this pattern
    const re = formatCache.get(pattern)

    // Execute the regex and get the match result
    const match = re.exec(logEvent)

    // If a match is found, return an array with the entire matched string and the captured groups
    return match || null
  }


  /**
   * Processes a log event and checks if it matches a given rule pattern.
   * If it does, emits an event with relevant data.
   *
   * @param {string} logEvent - The log event string to process.
   * @param {Object} rule - The rule object containing the pattern and event name.
   * @param {Object} metadata - An object containing various metadata like { timestamp, thread, level, logger }.
   */
  #processLogEventWithRule = (logEvent, rule, metadata) => {
    if (rule.logger && rule.logger !== metadata.logger) {
      return
    }

    if (rule.thread && rule.thread !== metadata.thread) {
      return
    }

    try {
      const match = this.#matchPatternInLogEvent(rule.pattern, logEvent)
      if (match) {
        const [...data] = match
        this.emit('eventData', { timestamp: metadata.timestamp, logLevel: metadata.level, eventName: rule.eventName, data })
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.#emitSystemMessage({ level: levels.error, message: `RegExp SyntaxError: ${e.message}` })
      } else {
        this.#emitSystemMessage({ level: levels.error, message: e.message })
      }
    }
  }

  /**
   * Reads new lines from the log file and processes them.
   *
   * @param {Object} [options] - Optional parameters
   * @param {boolean} [options.buildCacheOnly=false] - Whether to only build the event cache without emitting events
   *
   * @example
   * await readNewLines({ buildCacheOnly: true })
   */
  #processBufferedLogEvent({ buildCacheOnly }) {
    if (this.#eventCache.has(this.#buffer)) {
      dbg_fw(`Skipping cached event: ${this.#buffer}`)
      return
    }

    dbg_fw(`Processing buffered event: ${this.#buffer}`)
    const metadata = this.#extractLogEventMetadata(this.#buffer)
    if (metadata.timestamp) {
      if (!buildCacheOnly) {
        rules.forEach((rule) => {
          this.#processLogEventWithRule(this.#buffer, rule, metadata)
        })
      }

      this.#eventCache.add(this.#buffer)
      this.#buffer = ''  // Clear the buffer
    }
  }

  /**
   * Asynchronously reads the statistics of the log file.
   *
   * @returns {Promise<number|null>} A Promise that resolves with the size of the file in bytes, or null if the file does not exist.
   *
   * @example
   * const stats = await readFileStats()
   * if (stats) {
   *   console.log(stats.size)  // Output will show the size of the file in bytes
   * } else {
   *   console.log('File does not exist')
   * }
   */
  async #readFileSize() {
    try {
      const stats = await fs.promises.stat(this.#filePath)
      return stats.size
    } catch (error) {
      this.#emitSystemMessage({ level: levels.error, message: `File read error: ${error.message}` })
      return null
    }
  }

  /**
   * Reads new lines from the log file and processes them.
   */
  async #readNewLines({ buildCacheOnly = false, logProgress = false } = {}) {
    this.#isReading = true
    this.#shouldReadAgain = false

    // we don't expect bufferOverlap at file start
    let isBufferOverlapContinueReading = this.#nextStartPosition === 0

    let dbg_overlappingLogEvents = 0
    let dbg_logEvents = 0

    const fileSize = await this.#readFileSize()
    if (fileSize === null) return

    if (fileSize >= this.#nextStartPosition) {
      // GoBack NPosition to ensure buffer overlapping
      this.#nextStartPosition = Math.max(0, this.#nextStartPosition - this.#overlappingGoBackNPositions)
    } else {
      // the file has been rotated. We clear the cache and read from file start
      this.#nextStartPosition = 0
      this.#eventCache.clear()
      // we cannot have buffer overlap at the file start, but we set the flag to continue reading
      isBufferOverlapContinueReading = true
      this.#emitSystemMessage({ level: levels.notice, message: `The Bisq logfile ${this.#filePath} has been rotated!` })
    }

    if (logProgress) this.#logProgress({ fileSize })

    try {
      // Log the status before reading lines
      dbg_fw(`Reading lines from file. start: ${this.#nextStartPosition}, fileSize: ${fileSize}, lastLineRead: ${this.#lastPositionProcessed}`)

      // Create a read stream starting from 'start'
      const fileStream = fs.createReadStream(this.#filePath, { start: this.#nextStartPosition })
      const rl = readline.createInterface({ input: fileStream, terminal: false })

      rl.on('close', () => {
        // Process remaining buffer when readline interface is closed
        if (this.#buffer) {
          this.#processBufferedLogEvent( { buildCacheOnly })
        }
      })

      let isBufferUpdated = false
      for await (const line of rl) {
        const { timestamp } = this.#extractLogEventMetadata(line)

        // Check if the line is the beginning of a logEvent
        if (timestamp) {
          if (this.#buffer) {
            if (this.#eventCache.has(this.#buffer)) {
              dbg_overlappingLogEvents += 1
              isBufferOverlapContinueReading = true
            }

            if (!isBufferOverlapContinueReading) {
              dbg_fw(`No buffer overlap, we stop reading lines so we can go back`)
              break
            }

            this.#processBufferedLogEvent({ buildCacheOnly })
          }

          this.#buffer = line // Store the new line in the buffer
          isBufferUpdated = true
          dbg_logEvents += 1
        } else {
          if (this.#buffer) {
            // If line doesn't have timestamp and level, append to buffer
            this.#buffer += '\n' + line
            isBufferUpdated = true
          }
        }

        if (logProgress) this.#logProgress({ line })
      }

      // Check is we update the buffer by reading from the file
      if (isBufferUpdated) {
        // We advanced our position in the file
        this.#nextStartPosition = fileSize
        dbg_fw(`Done reading new lines. lastPositionProcessed ${fileSize}`)
      } else {
        // we don't have a buffer overlap, we need to read again (will goBack NPosition to seek buffer overlapping)
        dbg_fw(`Done reading new lines, but we had no new data to process (no buffer overlap)`)
      }
      dbg_fw({ dbg_overlappingLogEvents, dbg_newLogEvents: dbg_logEvents - dbg_overlappingLogEvents, dbg_cachedEvents: this.#eventCache.size })
    } catch (error) {
      this.#emitSystemMessage({ level: levels.error, message: `File read error: ${error.message}` })
    } finally {
      this.#isReading = false
      if (this.#shouldReadAgain || !isBufferOverlapContinueReading) {
        dbg_fw('Missed a file change. Reading new lines again...')
        await this.#readNewLines()
      }

      if (logProgress) this.#emitSystemMessage({ level: levels.debug, message: `logProcessor: Reading the logfile at start... 100%` })
    }
  }

  /**
   * Starts watching the log file for changes and processes new lines accordingly.
   *
   * @example
   * const logProcessor = new LogProcessor(config)
   * await logProcessor.startWatching()
   */
  async startWatching() {
    if (this.#watcher) {
      return
    }

    this.#emitSystemMessage({ level: levels.info, message: `logProcessor: Starting...` })

    this.#emitSystemMessage({ level: levels.debug, message: `logProcessor: Building cache...` })
    this.#buildFormatCache()

    dbg_fw('Reading the logfile at start...')
    this.#emitSystemMessage({ level: levels.debug, message: `logProcessor: Reading the logfile at start...` })
    await this.#readNewLines({ buildCacheOnly: this.#atStartBuildEventCacheOnly, logProgress: true })

    try {
      this.#watcher = chokidar.watch(this.#filePath)

      this.#watcher.on('change', async () => {
        dbg_fw('File change detected')
        if (this.#isReading) {
          dbg_fw('Skipping read due to ongoing read operation')
          this.#shouldReadAgain = true
          return
        }

        dbg_fw('Reading new lines...')
        await this.#readNewLines()
      })

      this.#watcher.on('error', error => {
        this.#emitSystemMessage({ level: levels.error, message: `File watcher error: ${error.message}`})
      })

      this.#emitSystemMessage({ level: levels.info, message: `Started watching file ${this.#filePath}` })
    } catch (error) {
      this.#emitSystemMessage({ level: levels.error, message: `Failed to watch file: ${error.message}`})
    }
  }

  /**
   * Stops watching the log file.
   *
   * @example
   * const logProcessor = new LogProcessor('path/to/log/file')
   * logProcessor.startWatching()
   * logProcessor.stopWatching()
   */
  stopWatching() {
    if (this.#watcher) {
      this.#emitSystemMessage({ level: levels.notice, message: `logProcessor: Stopping...` })
      this.#watcher.close()
      this.#watcher = null
      this.#emitSystemMessage({ level: levels.notice, message: `Stopped watching file ${this.#filePath}` })
      this.#emitSystemMessage({ level: levels.notice, message: `logProcessor: Stopped!` })
    }
  }
}

export default LogProcessor
