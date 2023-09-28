import LogProcessor from './logProcessor.mjs'
import Logger from './logger.mjs'
import { config } from '../app.config.mjs'
import { levels } from './syslog.mjs'

const logProcessors = []
const loggerInstances = []

console.log(`bisq-watcher application has started!`)

config.forEach(({ logger: loggerConfig, ...config }) => {
  // Initialize a Logger instance based on the logger config
  const loggerInstance = new Logger(loggerConfig)
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

// Function to handle graceful shutdown
const gracefulShutdown = async (signal) => {
  loggerInstances.forEach((loggerInstance) => loggerInstance.handleEventData({
    eventName: `systemNotice`,
    logLevel: levels.notice,
    timestamp: new Date(),
    data: [levels.notice, `Received ${signal}, shutting down gracefully...`]
  }))
  console.log(`Received ${signal}, shutting down gracefully...`)

  logProcessors.forEach((logProcessor) => {
    logProcessor.stopWatching()
  })

  // Wait for all loggerInstance.close() promises to resolve
  await Promise.all(loggerInstances.map((loggerInstance) => loggerInstance.close()))

  process.exit()
}

// Listen for TERM signal (e.g., kill)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM').catch(err => {
  console.error('Error during shutdown:', err)
  process.exit(1)
}))

// Listen for INT signal (e.g., Ctrl + C)
process.on('SIGINT', () => gracefulShutdown('SIGINT').catch(err => {
  console.error('Error during shutdown:', err)
  process.exit(1)
}))
