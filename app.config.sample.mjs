/**
 * Application Configuration File
 *
 * @typedef {Object} LoggerConfig
 * @property {string} type - Type of logger. Possible values: 'telegram', 'console', 'file'.
 * @property {string} [apiToken] - API Token for telegram. Required if type is 'telegram'.
 * @property {string[]} [chatIds] - Chat IDs for telegram. Required if type is 'telegram'.
 * @property {boolean|Function} [timestamp] - Whether to include timestamp. Can also be a formatting function.
 * @property {string} [filename] - File name for log. Required if type is 'file'.
 * @property {boolean} enabled - Whether this logger is enabled.
 *
 * @typedef {Object} AppConfig
 * @property {string} logFile - The location of the Bisq log file.
 *                              Supports environment variables like '%USERPROFILE%' (Windows), '$HOME' (Unix).
 *                              Default Locations:
 *                                - Windows: '%USERPROFILE%\\AppData\\Roaming\\Bisq\\bisq.log'
 *                                - macOS: '/Users/<username>/Library/Application Support/Bisq/bisq.log'
 *                                - Linux: '/home/<username>/.local/share/Bisq/bisq.log'
 * @property {LoggerConfig[]} logger - Array of logger configurations.
 *
 * Example:
 * ```javascript
 * [
 *   {
 *     logFile: '%USERPROFILE%\\AppData\\Roaming\\Bisq\\bisq.log',
 *     logger: [
 *       {
 *         type: 'telegram',
 *         apiToken: 'API_TOKEN',
 *         chatIds: ['CHAT_ID_1', 'CHAT_ID_2'],
 *         timestamp: false,
 *         enabled: true,
 *       },
 *       {
 *         type: 'console',
 *         timestamp: true,
 *         enabled: true,
 *       },
 *       {
 *         type: 'file',
 *         filename: 'app.log',
 *         timestamp: true,
 *         enabled: true,
 *       }
 *     ]
 *   }
 * ]
 * ```
 */
export const config = [
  {
    logFile: '%USERPROFILE%\\AppData\\Roaming\\Bisq\\bisq.log',
    logger: [
      {
        type: 'telegram',
        apiToken: "721156:AAEfjLOoYRQ4kvEMEQT8H6RS85zFPVY",
        chatIds: ['14944806'],
        timestamp: false,
        enabled: false,
      },
      {
        type: 'console',
        timestamp: true,
        enabled: true,
      },
      {
        type: 'file',
        filename: './logs/app.log',
        timestamp: true,
        enabled: false,
      },
    ]
  }
]
