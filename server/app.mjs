import validateConfiguration from './validateConfiguration.mjs'
import { startWatchers, stopWatchers } from './startWatchers.mjs'

console.log(`bisq-watcher application has started!`)

const returnCode = validateConfiguration()
if ( returnCode !== 0) {
  console.error('Invalid configuration, exiting...')
  process.exit(returnCode)
}

startWatchers()

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
