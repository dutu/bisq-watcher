/**
 * bisq-watcher Application Configuration File
 *
 * @typedef {Object} WatcherConfig
 * @property {string} [name] - The name of the watcher. If present all messages will be prefixed with this name.
 * @property {string} logFile - The location of the Bisq log file.
 * @property {TransportConfig[]} transports - Array of transport configurations.
 * @property {DebugConfig} [debug] - Debug configurations for the watcher.
 * @property {OverwriteRuleConfig[]} [overwriteRules] - Optional. Array of overwrite rule configurations for the watcher.
 */

/**
 * Transport Configuration
 *
 * @typedef {Object} TransportConfig
 * @property {'console'|'telegram'|'file'} type - Type of logger
 * @property {string} [apiToken] - API Token for telegram. Required if type is 'telegram'.
 * @property {string[]} [chatIds] - Chat IDs for telegram. Required if type is 'telegram'.
 * @property {boolean|string} [timestamp=flase] - Whether to include timestamp. Can also be a formatting string (see https://day.js.org/docs/en/display/format).
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'notice'|'debug'} [level] - Maximum log level the logger transport will log.
 * @property {boolean} [disabled=false] - Whether this logger is enabled.
 * @property {OverwriteRuleConfig[]} [overwriteRules] - Array of rule configurations for the logger.
 */

/**
 * Overwrite Rule Configuration for logger
 *
 * @typedef {Object} OverwriteRuleConfig
 * @property {string} eventName - The name of the rule to overwrite.
 * @property {string} [message] - A template string for formatting the message to emit.
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'notice'|'debug'} [level='info'] - Overwrites the severity level of the original log event from Bisq log.
 * @property {boolean} [sendToTelegram=true] - Flag indicating whether to send the message to Telegram.
 * @property {'active'|'inactive'} [activation] - Forces a rule do become active or not for respective watcher or transport
 *
 * This key is optional. When present, it is used to overwrite the default rules
 * found in the '/server/rules/' folder. Specific `eventName` parameters will
 * overwrite the default rule: transport rule overwrites watcher rule, which
 * in turn overwrites the default rule.
 */

/**
 * Debug Configuration for watcher
 *
 * @typedef {Object} DebugConfig
 * @property {boolean} [atStartProcessEntireLogFile=true] - Flag indicating whether existing logfile should be read and process at application start.
 * @property {number} [overlappingGoBackNPositions] - Size in bytes for buffer overlapping when reading Bisq logfile.
 * @property {boolean} [useHash=true] - Flag indicating whether cached log events should be stored in clear text or hashed.
 */

export default {
  name: 'main',
  logFile: '%USERPROFILE%\\AppData\\Roaming\\Bisq\\bisq.log',
  transports: [
    {
      type: 'telegram',
      apiToken: "xxxxxxxxx:xxxxxxxxxxxxxxxxxxxxx-xxxxx",
      chatIds: ['135792468'],
      level: 'notice',
      disabled: true,
    },
    {
      type: 'console',
      timestamp: 'MMM DD, HH:MM:ss.SSS',
      level: 'debug',
      overwriteRules: [
        {
          eventName: 'BlockchainDownloadProgressTracker',
          activation: 'active',
        },
        {
          eventName: 'End of sync detected',
          activation: 'active',
        },
      ],
    },
    {
      type: 'file',
      filename: './logs/app.log',
      timestamp: true,
      level: 'notice',
      disabled: true,
    },
  ],
  debug: {
    atStartProcessEntireLogFile: false,
  },
  overwriteRules: [
  ]
}
