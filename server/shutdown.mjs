import { exec } from 'child_process'
import { stopWatchers } from './startWatcher.mjs'

/**
 * Stops the PM2 application using the `pm2 stop` command.
 *
 * @returns {Promise<void>}
 * @example
 * await stopPM2App()
 */
const stopPM2App = () => {
  return new Promise((resolve, reject) => {
    const appName = process.env.name || process.env.pm2_service || 'bisq-watcher' // Fallback to 'bisq-watcher'
    exec(`pm2 stop ${appName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

/**
 * Stops the application, either through PM2 or directly.
 *
 * @param {number} [exitCode=0] - The exit code to use when stopping the application.
 * @returns {Promise<void>}
 * @example
 * await stopApp(1)
 */
const stopApp = async (exitCode = 0) => {
  if (process.env.pm_id) {
    try {
      await stopPM2App()
    } catch (error) {
      console.log(`Error while stopping PM2 app: ${error}`)
    }
  }
  console.log(`Exiting with exit code ${exitCode}...`)
  process.exit(exitCode)
}

/**
 * Handles the graceful shutdown of the application.
 *
 * @param {string} signal - The signal that initiated the shutdown.
 * @returns {Promise<void>}
 * @example
 * await gracefulShutdown('SIGTERM')
 */
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`)
  await stopWatchers(signal)
  await stopApp()
}

export { stopApp, gracefulShutdown }
