import LogProcessor from './logProcessor.mjs'
import Logger from './logger.mjs'
import { config } from '../app.config.mjs'
import { levels } from './syslog.mjs'

const logProcessors = []
const loggerInstances = []

config.forEach(({ logger, ...config }) => {
  // Initialize a Logger instance based on the logger config
  const loggerInstance = new Logger(logger)

  // Initialize a LogProcessor instance
  const logProcessor = new LogProcessor(config)

  // Event listeners
  logProcessor.on('eventData', (eventData) => {
    loggerInstance.handleEventData(eventData)
  })

  // Start watching the log file
  logProcessor.startWatching()

  // Add to the array for later cleanup
  loggerInstances.push(loggerInstance)
  logProcessors.push(logProcessor)
})

// Function to handle graceful shutdown
const gracefulShutdown = async (signal) => {
  loggerInstances.forEach((logger) => logger.handleEventData({
    eventName: `systemNotice`,
    logLevel: levels.notice,
    timestamp: new Date(),
    data: [levels.notice, `Received ${signal}, shutting down gracefully...`]
  }))
  console.log(`Received ${signal}, shutting down gracefully...`)

  logProcessors.forEach(logProcessor => {
    logProcessor.stopWatching()
  })

  // Wait for all loggerInstance.close() promises to resolve
  await Promise.all(loggerInstances.map(loggerInstance => loggerInstance.close()))

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
