import { validateConfiguration, AppConfigError } from './validateConfiguration.mjs'
import { startWatcher, stopWatchers } from './startWatcher.mjs'

let appConfig

console.log(`bisq-watcher application has started!`)

// Try to validate the application's configuration and rules.
// If an error occurs, it will be caught and handled appropriately.
try {
  appConfig = await validateConfiguration()
} catch (error) {
  if (error instanceof AppConfigError) {
    console.error(`${error.message}`)
    console.error('Invalid configuration. Exiting...')
    process.exit(error.exitCode)
  }
}

startWatcher(appConfig)

// Function to handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`)
  await stopWatchers(signal)
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
