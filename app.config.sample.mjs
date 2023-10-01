/**
 * Application Configuration File
 *
 * @typedef {Object} MainConfig
 * @property {WatcherConfig[]} watchers - Array of watcher configurations.
 */

/**
 * Watcher Configuration
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
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'debug'} [level] - Maximum log level the logger transport will log.
 * @property {boolean} [disabled=false] - Whether this logger is disabled.
 * @property {OverwriteRuleConfig[]} [overwriteRules] - Array of rule configurations for the logger.
 */

/**
 * Overwrite Rule Configuration for logger
 *
 * @typedef {Object} OverwriteRuleConfig
 * @property {string} eventName - The name of the rule to overwrite.
 * @property {string} [logger] - The origin logger of the Bisq log event.
 * @property {string} [thread] - The origin thread of the Bisq log event.
 * @property {string} [pattern] - The string pattern to match against the Bisq log event.
 * @property {string} [message] - A template string for formatting the message to emit.
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'debug'} [level='info'] - overwrites the severity level of the original log event from Bisq log.
 * @property {boolean} [sendToTelegram=true] - Flag indicating whether to send the message to Telegram.
 * @property {boolean} [disabled=true] - Flag indicating whether the rule is active or not.
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
 * @property {boolean} [atStartBuildEventCacheOnly=flase] - Flag indicating whether existing logfile should be read and log event to be sent to loggers.
 * @property {number} [overlappingGoBackNPositions] - Size in bytes for buffer overlapping when reading Bsiq logfile.
 * @property {boolean} [useHash=true] - Flag indicating whether cached log events should be stored in clear text or hashed.
 */

export const watchers = {
  watchers: [
    {
      name: 'main',
      logFile: '%USERPROFILE%\\AppData\\Roaming\\Bisq\\bisq.log',
      transports: [
        {
          type: 'telegram',
          apiToken: "624126:AAEfjLOoYRQ4kvEMEQT8H6RS85zFPVY",
          chatIds: ['1884806'],
          level: 'info',
          timestamp: false,
          enabled: false,
          overwriteRules: [
            {
              eventName: 'BlockchainDownloadProgressTracker',
              enabled: false,
            },
          ],
        },
        {
          type: 'console',
          timestamp: 'MMM DD, HH:MM:ss.SSS',
          enabled: true,
        },
        {
          type: 'file',
          filename: './logs/app.log',
          timestamp: true,
          enabled: false,
        },
      ],
      debug: {
        atStartBuildEventCacheOnly: false,
        overlappingGoBackNPositions: 20000,
      },
      overwriteRules: [
      ]
    }
  ]
}
