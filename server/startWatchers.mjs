/**
 * Provides the functions to start and stop the watchers.
 */

import appConfig from '../app.config.mjs'
import Logger from './logger.mjs'
import { levels } from './syslog.mjs'
import LogProcessor from './logProcessor.mjs'

const logProcessors = []
const loggerInstances = []

export const startWatchers = function startWatchers() {
  appConfig.watchers.forEach((config) => {
    // Initialize a Logger instance based on the logger config
    const loggerInstance = new Logger(config)
    loggerInstances.push(loggerInstance)

    loggerInstance.handleEventData({
      eventName: `systemInfo`,
      logLevel: levels.info,
      timestamp: new Date(),
      data: [levels.info, `bisq-watcher application has started!`]
    })

    // Initialize a LogProcessor instance
    const logProcessor = new LogProcessor(config)

    // Event listeners
    logProcessor.on('eventData', (eventData) => {
      loggerInstance.handleEventData(eventData)
    })

    // Start watching the log file
    logProcessor.startWatching()

    // Add to the array for later cleanup
    logProcessors.push(logProcessor)
  })
}

export const stopWatchers = async  function stopWatchers(signal) {
  loggerInstances.forEach((loggerInstance) => loggerInstance.handleEventData({
    eventName: `systemNotice`,
    logLevel: levels.notice,
    timestamp: new Date(),
    data: [levels.notice, `Received ${signal}, shutting down gracefully...`]
  }))

  logProcessors.forEach((logProcessor) => {
    logProcessor.stopWatching()
  })

  // Wait for all loggerInstance.close() promises to resolve
  await Promise.all(loggerInstances.map((loggerInstance) => loggerInstance.close()))
}
