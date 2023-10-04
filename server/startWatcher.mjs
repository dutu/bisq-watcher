/**
 * Provides the functions to start and stop the watchers.
 */

import Logger from './logger.mjs'
import { levels } from './syslog.mjs'
import LogProcessor from './logProcessor.mjs'
import { appVersion } from './app.mjs'

let logProcessor
const loggerInstances = []

/**
 * Starts the watcher based on the given configuration.
 *
 * @param {Object} config - Configuration object for the watcher and logger
 */
export const startWatcher = function startWatcher(config) {
  // Initialize a Logger instance based on the logger config
  const loggerInstance = new Logger(config)
  loggerInstances.push(loggerInstance)

  loggerInstance.handleEventData({
    eventName: `systemInfo`,
    logLevel: levels.info,
    timestamp: new Date(),
    data: [levels.info, `bisq-watcher v${appVersion} application has started!`]
  })

  // Initialize a LogProcessor instance
  logProcessor = new LogProcessor(config)

  // Event listeners
  logProcessor.on('eventData', (eventData) => {
    loggerInstance.handleEventData(eventData)
  })

  // Start watching the log file
  logProcessor.startWatching()
}

/**
 * Stops the watcher.
 *
 * @param {string} signal - The signal received that initiated the shutdown
 * @returns {Promise<void>} A promise that resolves when all watchers have been stopped
 */
export const stopWatcher = async  function stopWatcher(signal) {
  loggerInstances.forEach((loggerInstance) => loggerInstance.handleEventData({
    eventName: `systemNotice`,
    logLevel: levels.notice,
    timestamp: new Date(),
    data: [levels.notice, `Received ${signal}, shutting down gracefully...`]
  }))

  await logProcessor.stopWatching()

  // Wait for all loggerInstance.close() promises to resolve
  await Promise.all(loggerInstances.map((loggerInstance) => loggerInstance.close()))
}
