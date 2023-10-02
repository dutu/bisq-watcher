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

      const ruleMap = this.#buildTransportRules(loggerConfig, transportConfig)
      const filterMessage = winston.format(this.#filterMessage.bind(this, ruleMap))()
      const formatTimestamp = winston.format(this.#formatTimestamp.bind(this, transportConfig.timestamp))()

      let transport
      if (transportConfig.type === 'console') {
        const populateMessage = this.#populateMessage.bind(this, ruleMap)
        transport = new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            filterMessage,
            formatTimestamp,
            winston.format.printf(populateMessage),
            winston.format.colorize({ all: true }),
          )
        })
      }

      if (transportConfig.type === 'file') {
        const formatEventDataForFileOutput = this.#populateJson.bind(this, transportConfig)
        transport = new winston.transports.File({
          level: 'debug',
          filename: transportConfig.filename,
          format: winston.format.combine(
            filterMessage,
            winston.format.printf(formatEventDataForFileOutput),
          )
        })
      }

      if (transportConfig.type === 'telegram') {
        const populateMessage = this.#populateMessage.bind(this, ruleMap)
        transport = new TelegramTransport({
          apiToken: transportConfig.apiToken,
          chatIds: transportConfig.chatIds,
          format: winston.format.combine(
            filterMessage,
            winston.format.printf(populateMessage),
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

    this.#logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      transports,
      exitOnError: false,
    })
  }

  /**
   * Private method to build the ruleMap applicable for a transport,
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
      if (!rule.isActive)
      ruleMap.delete(rule.eventName)
    })
    return ruleMap
  }

  /**
   * Filters out messages without rule (isActive was false)
   *
   * @param {Map} ruleMap - The rule map
   * @param {Object} info - The winston log entry.
   * @return {Object|false} - Returns original info object if rule exists, and false otherwise
   */
  #filterMessage(ruleMap, info) {
    const eventData = info.meta
    return ruleMap.has(eventData.eventName) ? info : false
  }

  /**
   * Private for adding and formatting the timestamp based on transport configuration.
   * It either adds a formatted timestamp to the log entry
   * or removes the timestamp from the log entry
   * based on the presence of the timestamp formatter.
   *
   * @param {string|boolean} timestampConfig - The timestamp formatter
   * @param {Object} info - The winston log entry.
   */
  #formatTimestamp(timestampConfig, info) {
    if (timestampConfig) {
      const eventData = info.meta
      info.timestamp = formatTimestamp(timestampConfig, eventData.timestamp)
    } else {
      delete info.timestamp
    }

    return info
  }

  /**
   * Private method to populate log messages based on the rule that matches the event data.
   *
   * @param {Map} ruleMap - Transport's rule map .
   * @param {Object} info - The object containing the winston log entry.
   * @returns {string} - The populated log message.
   */
  #populateMessage = (ruleMap, info) => {
    const { level, message, timestamp = '', meta: eventData } = info
    const rule = ruleMap.get(eventData.eventName)
    const icon = icons[level] + ' ' || ''

    // Build the message using the rule's message template and eventData.data
    let ruleMessage = rule.message
    if (Array.isArray(eventData.data)) {
      for (let index = 1; index < eventData.data.length; index += 1) {
        const placeholder = `{${index - 1}}`
        ruleMessage = ruleMessage.replaceAll(placeholder, eventData.data[index])
      }

      ruleMessage = ruleMessage.replace('{*}', eventData.data[0])
    }

    const populatedMessage = `${timestamp}${icon}[${level}] ${ruleMessage}`
    return populatedMessage
  }

  #populateJson(transportConfig, info) {
    const eventData = info.meta
    let formattedMessage = {
      ...eventData,
      message: this.#populateMessage(transportConfig, info)
    }

    return JSON.stringify(formattedMessage, null, 2)
  }

  /**
   * Handles event data and logs it.
   *
   * @param {Object} eventData - The event data.
   */
  handleEventData(eventData) {
    this.#logger.log({ level: eventData.logLevel, message: '', meta: eventData })
  }

  /**
   * Closes the logger and its associated transports, flushing any buffered logs.
   *
   * This method should be called to ensure all logs are written before an application exits.
   */
  async close() {
    const eventData = {
      eventName: `systemNotice`,
      logLevel: levels.notice,
      timestamp: new Date(),
      data: [levels.notice, 'Closing logger...']
    }

    return new Promise((resolve) => {
      this.#logger.on('finish', function (notice) {
        resolve()
      })
      this.#logger.log({ level: levels.notice, message: '', meta: eventData })
      this.#logger.end()
    })
  }
}
