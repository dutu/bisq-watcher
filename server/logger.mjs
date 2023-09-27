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
  #rules

  /**
   * Creates a Logger instance with the specified configuration.
   *
   * @param {Array} loggerConfig - The logger configuration.
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
    this.#rules = [...systemRules, ...rules]
    const transports = []

    loggerConfig.forEach(config => {
      if (!config.enabled) {
        return
      }

      const populateMessage = this.#populateMessage.bind(this, config)
      let transport
      if (config.type === 'console') {
        transport = new winston.transports.Console({
          format: winston.format.combine(
            winston.format.printf(populateMessage),
            winston.format.colorize({ all: true }),
          )
        })
      }

      if (config.type === 'file') {
        const formatEventDataForFileOutput = this.#populateJson.bind(this, config)
        transport = new winston.transports.File({
          filename: config.filename,
          format: winston.format.combine(
            winston.format.printf(formatEventDataForFileOutput),
          )
        })
      }

      if (config.type === 'telegram') {
        transport = new TelegramTransport({
          apiToken: config.apiToken,
          chatIds: config.chatIds,
          format: winston.format.combine(
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
   * Private method to populate log messages based on the rule that matches the event data.
   *
   * @param {Object} params - Object containing the timestamp, level, and message.
   * @param {string} params.level - The level of the log.
   * @param {string} params.message - The message of the log.
   * @param {string} params.meta - The eventData of the log.
   * @returns {string} - The populated log message.
   */
  #populateMessage = (transportConfig, { level, message, meta: eventData }) => {
    let populatedMessage
    const rule = this.#rules.find(r => r.eventName === eventData.eventName)
    if (rule) {
      const icon = icons[level] + ' ' || ''
      const timestamp = formatTimestamp(eventData.timestamp, transportConfig.timestamp)

      // Build the message using the rule's message template and eventData.data
      let ruleMessage = rule.message
      if (Array.isArray(eventData.data)) {
        eventData.data.forEach((item, index) => {
          const placeholder = `{${index}}`
          ruleMessage = ruleMessage.replace(placeholder, item)
        })
      }

      populatedMessage = `${timestamp}${icon}[${level}] ${ruleMessage}`
    } else {
      populatedMessage = message
    }

    return populatedMessage
  }

  #populateJson(transportConfig, { level, message, meta: eventData }) {
    let formattedMessage = {
      ...eventData,
      message: this.#populateMessage(transportConfig, { level: eventData.logLevel, message: '', meta: eventData })
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
