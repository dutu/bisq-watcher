import { EventEmitter } from 'eventemitter3'
import fs from 'fs'
import chokidar from 'chokidar'
import readline from 'readline'
import { resolveEnvVariablesInPath, capitalize } from './util.mjs'
import { levels } from './syslog.mjs'
import rules from './rules/rules.mjs'


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
  #filePath
  #lastLineRead = 0
  #buffer = ''
  #watcher


  constructor(filePath) {
    super()
    this.#filePath = resolveEnvVariablesInPath(filePath)
  }

  /**
   * Converts log file level to syslog level
   *
   * @param {string} level - Log level from the log file.
   * @returns {string} - Corresponding syslog level.
   */
  #convertLogLevel(level) {
    const levelMap = {
      'ALERT': 'alert',
      'ERROR': 'error',
      'WARN': 'warning',
      'INFO': 'info',
      'DEBUG': 'debug'
    }
    return levelMap[level.toUpperCase()] || 'unknown'
  }

  #emitSystemMessage({ level, message }) {
    this.emit('eventData', { timestamp: new Date(), eventName: `system${capitalize(level)}`, logLevel: level, data: [level, message] })
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
    // Escape any special regex characters in the pattern
    let escapedPattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    // Initialize format with escaped pattern enclosed by [\s\S]*
    let format = `[\\s\\S]*${escapedPattern}[\\s\\S]*`

    // Replace each placeholder in the escaped pattern with the corresponding regex
    format = format.replace(/\\\{(\d+)(?::(\w+))?\\\}/g, (match, index, specifier) => {
      // Check if we are at the last placeholder in the pattern
      const isLastPlaceholder = escapedPattern.lastIndexOf(match) + match.length === escapedPattern.length

      // If the specifier is 'uptoHyphen', use a specific regex pattern
      if (specifier === 'uptoHyphen') {
        return '([^\\-]+)(?:-[^,]+)?'
      }

      // Use a greedy capture (.+) only if it's the last placeholder and at the end of the pattern
      if (isLastPlaceholder) {
        return '(.+)'
      }

      return '(.+?)'
    })

    // Create a new RegExp object with the generated format
    const re = new RegExp(format, 'm')

    // Execute the regex and get the match result
    const match = re.exec(logEvent)

    // If a match is found, return the captured groups, skipping the first element
    // which is the entire matched string.
    if (match) {
      return match.slice(1)
    } else {
      return null
    }
  }


  /**
   * Processes a log event and checks if it matches a given rule pattern.
   * If it does, emits an event with relevant data.
   *
   * @param {string} logEvent - The log event string to process.
   * @param {Object} rule - The rule object containing the pattern and event name.
   * @param {string} extractedTimestamp - The timestamp extracted from the log event.
   * @param {string} extractedLogLevel - The log level extracted from the log event.
   *
   * @example
   * processLogEventWithRule(
   *   'Set new state at BuyerAsMakerTrade (id=1234): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
   *   {
   *     eventName: 'DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
   *     pattern: 'Set new state at {0} (id={1}): {2}'
   *   },
   *   '2023-09-25T10:20:30Z',
   *   'INFO'
   * )
   */
  #processLogEventWithRule = (logEvent, rule, extractedTimestamp, extractedLogLevel) => {
    try {
      const match = this.#matchPatternInLogEvent(rule.pattern, logEvent)
      if (match) {
        const [...data] = match
        const timestampDate = new Date(extractedTimestamp)
        const convertedLogLevel = this.#convertLogLevel(extractedLogLevel)
        this.emit('eventData', { timestamp: timestampDate, logLevel: convertedLogLevel, eventName: rule.eventName, data })
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
   */
  async #readNewLines() {
    try {
      const fileSize = fs.statSync(this.#filePath).size
      let start = this.#lastLineRead
      if (fileSize < this.#lastLineRead) {
        start = 0
      }

      const fileStream = fs.createReadStream(this.#filePath, { start })
      const rl = readline.createInterface({ input: fileStream, terminal: false })

      rl.on('close', () => {
        // Process remaining buffer when readline interface is closed
        if (this.#buffer) {
          const logMetadataPattern = /^(\w+-\d+ \d+:\d+:\d+\.\d+) \[.*?\] (\w+) /
          const [, timestamp, level] = this.#buffer.match(logMetadataPattern) || []
          if (timestamp && level) {
            rules.forEach(rule => {
              this.#processLogEventWithRule(this.#buffer, rule, timestamp, level)
            })
          }
          this.#buffer = ''  // Clear the buffer
        }
      })

      for await (const line of rl) {
        const logMetadataPattern = /^(\w+-\d+ \d+:\d+:\d+\.\d+) \[.*?\] (\w+) /
        const [, timestamp, level] = line.match(logMetadataPattern) || []
        if (timestamp && level) {
          if (this.#buffer) {
            rules.forEach(rule => {
              this.#processLogEventWithRule(this.#buffer, rule, timestamp, level)
            })
            this.#buffer = ''  // Clear the buffer after processing
          }
          this.#buffer = line  // Store the new line in the buffer
        } else {
          this.#buffer += '\n' + line  // If line doesn't have timestamp and level, append to buffer
        }
      }

      this.#lastLineRead = fileSize
    } catch (error) {
      this.#emitSystemMessage({ level: levels.error, message: `File read error: ${error.message}` })
    }
  }

  /**
   * Starts watching the log file for changes.
   *
   * @example
   * const logProcessor = new LogProcessor('path/to/log/file')
   * logProcessor.startWatching()
   */
  startWatching() {
    if (this.#watcher) {
      return
    }

    this.#readNewLines()

    try {
      this.#watcher = chokidar.watch(this.#filePath)

      this.#watcher.on('change', () => {
        this.#readNewLines()
      })

      this.#watcher.on('error', error => {
        this.#emitSystemMessage({ level: levels.error, message: `Watcher error: ${error.message}`})
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
      const eventData = {
        eventName: `systemNotice`,
        logLevel: levels.notice,
        timestamp: Date.now(),
        data: [levels.notice, 'Closing logger...']
      }

      this.#watcher.close()
      this.#watcher = null
      this.#emitSystemMessage({ level: levels.notice, message: `Stopped watching file ${this.#filePath}` })
    }
  }
}

export default LogProcessor
