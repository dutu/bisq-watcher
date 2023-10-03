import { stopApp, gracefulShutdown } from './shutdown.mjs'
import { validateConfiguration, AppConfigError } from './validateConfiguration.mjs'
import { startWatcher } from './startWatcher.mjs'

let appConfig

console.log(`bisq-watcher application has started!`)

// Listen for TERM signal (e.g., kill)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM').catch((err) => {
  console.log('Error during shutdown:', err)
  process.exit(1)
}))

// Listen for INT signal (e.g., Ctrl + C)
process.on('SIGINT', () => gracefulShutdown('SIGINT').catch((err) => {
  console.log('Error during shutdown:', err)
  process.exit(1)
}))

// Try to validate the application's configuration and rules.
// If an error occurs, it will be caught and handled appropriately.
try {
  appConfig = await validateConfiguration()
} catch (error) {
  if (error instanceof AppConfigError) {
    console.log(`${error.message}`)
    await stopApp(error.exitCode)
  }
}

startWatcher(appConfig)
