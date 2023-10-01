import winston from 'winston'
import systemRules from './rules/systemRules.mjs'
import rules from './rules/rules.mjs'
import { levels, icons, colors } from './syslog.mjs'
import { TelegramTransport } from './telegramTransport.mjs'
import { formatTimestamp } from './util.mjs'

/**
 * A map for quickly accessing rules based on event names.
 *
 * This map is constructed by combining 'systemRules' and 'rules',
 * and it uses the 'eventName' property of each rule as the key.
 * The corresponding rule object is used as the value.
 *
 * @type {Map<string, Object>}
 */
const rulesMap = new Map([...systemRules, ...rules].map((rule) => [rule.eventName, rule]))

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

      let transport
      if (transportConfig.type === 'console') {
        transport = new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
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
            winston.format.printf(formatEventDataForFileOutput),
          )
        })
      }

      if (transportConfig.type === 'telegram') {
        transport = new TelegramTransport({
          apiToken: transportConfig.apiToken,
          chatIds: transportConfig.chatIds,
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

      const ruleMAp = this.#buildRules(transportConfig)
      const populateMessage = this.#populateMessage.bind(this, transportConfig, ruleMap)
      transports.push(transport)
    })

    this.#logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      transports,
      exitOnError: false,
    })
  }

  #buildRules(loggerConfig, transportConfig) {
    const ruleMap = new Map()

    const validateOverwriteRule = (rule) => {
        if (typeof rule.message !== 'string') {
          return false
        }

    }

    const overwriteRule = (rule) => {
      const overwrittenRule = ruleMap.get(rule.eventName)
      Object.keys(rule).forEach((key) => {
        if (['message', 'level', 'sendToTelegram'].includes(key)) {
          overwrittenRule[key] = rule[key]
        }

        if (key === 'activation') {
          if (rule.activation === 'active')  overwrittenRule.isActive = true
          if (rule.activation === 'inactive')  overwrittenRule.isActive = false
        }
      })
    }

    if (Array.isArray(loggerConfig.overwriteRules)) {
      loggerConfig.overwriteRules.forEach((rule) => overwriteRule(rule))
    }

    if (Array.isArray(transportConfig.overwriteRules)) {
      transportConfig.overwriteRules.forEach((rule) => overwriteRule(rule))
    }



    // Initialize ruleMap with defaultRules (disabled is false by default)
    rules.forEach(rule => {
      ruleMap.set(rule.eventName, { ...rule, disabled: rule.disabled || false })
    })

    if (Array.isArray(loggerConfig.overwriteRules)) {
      loggerConfig.overwriteRules.forEach((rule) => overwriteRule(rule))
    }

    // Variables to track the disabled state across transports
    const transportDisabledFalseCount = {}
    const transportDisabledTrueCount = {}
    let transportCount = 0

    // Update ruleMap with rules from enabled transports in config
    config.transports.forEach(transport => {
      if (transport.disabled) return

      transportCount += 1

      transport.overwriteRules?.forEach(overwriteRule => {
        if (overwriteRule.disabled === false) {
          transportDisabledFalseCount[overwriteRule.eventName] = (transportDisabledFalseCount[overwriteRule.eventName] || 0) + 1
        }

        if (overwriteRule.disabled === true) {
          transportDisabledTrueCount[overwriteRule.eventName] = (transportDisabledTrueCount[overwriteRule.eventName] || 0) + 1
        }
      })
    })

    config.overwriteRules?.forEach(overwriteRule => {
      if ('disabled' in overwriteRule) {
        ruleMap.set(overwriteRule.eventName, { ...overwriteRule })
      }

      if (transportDisabledTrueCount[overwriteRule.eventName] === transportCount) {
        ruleMap.set(overwriteRule.eventName, { ...overwriteRule, disabled: true })
      }

      if (overwriteRule.eventName in transportDisabledFalseCount && transportDisabledFalseCount[overwriteRule.eventName] > 0) {
        ruleMap.set(overwriteRule.eventName, { ...overwriteRule, disabled: false })
      }
    })

    // Filter out enabled rules (those that are not disabled)
    const enabledRules = [...ruleMap.values()].filter(rule => !rule.disabled)

    return enabledRules
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
    const rule = rulesMap.get(eventData.eventName)
    if (rule) {
      const icon = icons[level] + ' ' || ''
      const timestamp = formatTimestamp(eventData.timestamp, transportConfig.timestamp)

      // Build the message using the rule's message template and eventData.data
      let ruleMessage = rule.message
      if (Array.isArray(eventData.data)) {
        for (let index = 1; index < eventData.data.length; index += 1) {
          const placeholder = `{${index - 1}}`
          ruleMessage = ruleMessage.replaceAll(placeholder, eventData.data[index])
        }

        ruleMessage = ruleMessage.replace('{*}', eventData.data[0])
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
