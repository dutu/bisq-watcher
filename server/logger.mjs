import winston from 'winston'
import systemRules from './rules/systemRules.mjs'
import rules from './rules/rules.mjs'
import { levels, icons, colors } from './syslog.mjs'
import { TelegramTransport } from './telegramTransport.mjs'
import { formatTimestamp } from './util.mjs'

/**
 * Logger class for handling and storing logs.
 * It uses winston under the hood for different types of logging.
 *
 * The 'timestamp' option in the logger configuration can either be a boolean or a formatting function.
 * If it's `true`, the timestamp will be added as is.
 * If it's a function, it will be used to format the timestamp.
 *
 * @example
 * // Using boolean
 * timestamp: true
 *
 * // Using formatting function
 * timestamp: (ts) => `[Formatted: ${ts}]`
 *
 * Handles two types of events:
 * - 'eventData': The event data that comes from the LogProcessor.
 * - 'error': The error data.
 *
 *  @property {Object} #logger - The winston logger instance.
 *  @property {Array} #loggerConfig - The logger configuration from app.config.mjs.
 */
export default class Logger {
  #logger
  #loggerConfig

  /**
   * Creates a Logger instance with the specified configuration.
   *
   * @param {Object} loggerConfig - The logger configuration.
   *
   * Example:
   * ```javascript
   * const logger = new Logger([
   *  { type: 'console', timestamp: true, enabled: true },
   *  { type: 'file', filename: './logs/app.log', timestamp: true, enabled: true }
   * ])
   * ```
   */
  constructor(loggerConfig) {
    this.#loggerConfig = loggerConfig
    const transports = []

    loggerConfig.transports.forEach((transportConfig) => {
      if (transportConfig.disabled === true) {
        return
      }

      // default minlevel = 'notice'
      const maxLevel = transportConfig.maxLevel ?? levels.info

      const ruleMap = this.#buildTransportRules(loggerConfig, { maxLevel, ...transportConfig })

      const filterMessage = winston.format((info) => this.#filterMessage(maxLevel, ruleMap, info))()
      const formatTimestamp = winston.format((info) => this.#formatTimestamp(transportConfig.timestamp, info))()
      const populateMessage = winston.format((info) => this.#populateMessage(ruleMap, info))()

      let transport
      if (transportConfig.type === 'console') {
        transport = new winston.transports.Console({
          format: winston.format.combine(
            filterMessage,
            formatTimestamp,
            populateMessage,
            winston.format.printf(this.#formatConsoleMessage),
            winston.format.colorize({ all: true }),
          )
        })
      }

      if (transportConfig.type === 'file') {
        transport = new winston.transports.File({
          filename: transportConfig.filename,
          format: winston.format.combine(
            filterMessage,
            formatTimestamp,
            populateMessage,
            winston.format.printf(this.#formatFileMessage),
          )
        })
      }

      if (transportConfig.type === 'telegram') {
        transport = new TelegramTransport({
          apiToken: transportConfig.apiToken,
          chatIds: transportConfig.chatIds,
          format: winston.format.combine(
            filterMessage,
            populateMessage,
            winston.format.printf(this.#formatTelegramMessage),
          )
        })

        transport.eventEmitter.on('error', (error) => {
          const eventData = {
            logLevel: levels.error,
            eventName: 'telegramError',
            data: [levels.error, `${error.message || 'Unknown Error'}`],
            timestamp: new Date(),
          }

          this.#logger.log({ level: eventData.logLevel, message: '', meta: eventData })
        })
      }

      transports.push(transport)
    })

    winston.addColors(colors)
    this.#logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      level: levels.debug,
      transports,
      exitOnError: false,
    })
  }

  /**
   * Builds the ruleMap applicable for a transport,
   * by merging the default rules with overwriteRules from the transportConfig and the loggerConfig.
   *
   * @param {Object} loggerConfig - The logger configuration.
   * @param {Object} transportConfig - The transport configuration.
   * @returns {Map} - the ruleMap applicable for the transport
   */
  #buildTransportRules(loggerConfig, transportConfig) {
    // Initialize Rules map by combining 'systemRules' and 'rules' (isActive is true by default)
    const ruleMap = new Map([...systemRules, ...rules].map((rule) => [rule.eventName, { ...rule, isActive: rule.isActive ?? true }]))

    // Overwrites the rule from 'ruleMap'
    const overwriteRule = function overwriteRule(rule) {
      const overwrittenRule = ruleMap.get(rule.eventName)
      if (rule.activation === 'inactive') {
        overwrittenRule.isActive = false
        // we don't want to modify other parameters if rule is marked as 'inactive'
        return
      }

      Object.keys(rule).forEach((key) => {
        if (key === 'activation') {
          // Mark the rule active, since 'activation' key can only be 'active' at this point
            overwrittenRule.isActive = true
        } else {
          overwrittenRule[key] = rule[key]
        }
      })
    }

    if (loggerConfig.overwriteRules) {
      loggerConfig.overwriteRules.forEach((rule) => overwriteRule(rule))
    }

    if (transportConfig.overwriteRules) {
      transportConfig.overwriteRules.forEach((rule) => overwriteRule(rule))
    }

    // Remove inactive rules
    ruleMap.forEach((rule) => {
      if (
        !rule.isActive
        || transportConfig.type === 'telegram' && !rule.sendToTelegram
        || rule.level && winston.config.syslog.levels[rule.level] > winston.config.syslog.levels[transportConfig.minLevel]
      )
      ruleMap.delete(rule.eventName)
    })
    return ruleMap
  }

  /**
   * Filters out messages without rule (isActive was false)
   *
   * @param {'crit'|'alert'|'error'|'warning'|'info'|'notice'|'debug'} maxLevel - Maximum log level the logger transport will log.
   * @param {Map} ruleMap - The rule map
   * @param {Object} info - The log information object.
   * @return {Object|false} - Returns the log information object if rule exists, otherwise false
   */
  #filterMessage(maxLevel, ruleMap, info) {
    const { meta } = info
    const rule = ruleMap.get(meta.eventName)
    const level = rule?.level || meta.logLevel || info.level
    return rule && winston.config.syslog.levels[level] <= winston.config.syslog.levels[maxLevel] ? info : false
  }

  /**
   * Adds or removes a timestamp from the log entry based on the transport configuration.
   *
   * If a timestamp formatter is present, it adds a formatted timestamp to the log entry.
   * If not, it removes the timestamp property from the log entry.
   *
   * @param {string|boolean} timestampConfig - The timestamp formatter
   * @param {Object} info - The log information object.
   */
  #formatTimestamp(timestampConfig, info) {
    if (timestampConfig) {
      const { meta } = info
      info.timestamp = formatTimestamp(timestampConfig, meta.timestamp)
    } else {
      delete info.timestamp
    }

    return info
  }

  /**
   * Populates message and updates level of the object containing the winston log entry,
   * based on the rule that matches the event data.
   *
   * @param {Map} ruleMap - Transport's rule map .
   * @param {Object} info - The log information object. Contains properties for level, message, timestamp, and meta.
   * @returns {Object} - Updated log information object with populated message and new level.
   */
  #populateMessage(ruleMap, info) {
    const { meta } = info
    const rule = ruleMap.get(meta.eventName)

    // Populated the message using the rule's message template and eventData.data
    let populatedMessage = rule.message
    if (Array.isArray(meta.data)) {
      for (let index = 1; index < meta.data.length; index += 1) {
        const placeholder = `{${index - 1}}`
        populatedMessage = populatedMessage.replaceAll(placeholder, meta.data[index])
      }

      populatedMessage = populatedMessage.replace('{*}', meta.data[0])
    }

    // Update message
    info[Symbol.for('message')] = populatedMessage
    info.message = populatedMessage

    // Update level if overridden by rule
    if (rule.level) {
      info[Symbol.for('level')] = rule.level
      info.level = rule.level
    }

    return info
  }

  /**
   * Formats a message for console output.
   *
   * @param {Object} info - The log information object. Contains properties for level, message, timestamp, and meta.
   * @returns {string} The formatted log message for console output.
   */
  #formatConsoleMessage(info) {
    const {
      [Symbol.for('level')]: level,
      [Symbol.for('message')]: message,
      timestamp = '',
      meta,
    } = info

    const loggerName = `${meta.loggerName}: ` || ''
    const icon = icons[level] + ' ' || ''
    return `${timestamp}${icon}[${level}] ${message}`
  }

  /**
   * Formats a message for telegram output.
   *
   * @param {Object} info - The log information object. Contains properties for level, message, timestamp, and meta.
   * @returns {string} The formatted log message for telegram output.
   */
  #formatTelegramMessage(info) {
    const {
      [Symbol.for('level')]: level,
      [Symbol.for('message')]: message
    } = info
    const icon = icons[level] + ' ' || ''
    return `${icon}${message}`
  }

  /**
   * Formats a message for file output.
   *
   * @param {Object} info - The log information object. Contains properties for level, message, timestamp, and meta.
   * @returns {string} The formatted log message for telegram output.
   */
  #formatFileMessage(info) {
    const {
      [Symbol.for('level')]: level,
      [Symbol.for('message')]: message,
      timestamp,
      meta,
    } = info

    return JSON.stringify({ timestamp, level, message, meta }, null, 2)
  }

  /**
   * Handles event data and logs it.
   *
   * @param {Object} eventData - The event data.
   */
  handleEventData(eventData) {
    this.#logger.log({ level: eventData.logLevel, message: '', meta: {...eventData, loggerName: this.#loggerConfig.name } })
  }

  /**
   * Closes the logger and its associated transports, flushing any buffered logs.
   *
   * This method should be called to ensure all logs are written before an application exits.
   */
  async close() {
    const eventData = {
      eventName: `systemInfo`,
      logLevel: levels.info,
      timestamp: new Date(),
      data: [levels.info, 'Closing logger...']
    }

    return new Promise((resolve) => {
      this.#logger.on('finish', function (notice) {
        resolve()
      })
      this.#logger.log({ level: levels.info, message: '', meta: eventData })
      this.#logger.end()
    })
  }
}
