import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import dayjs from 'dayjs'

//import localizedFormat from 'dayjs/plugin/localizedFormat'
//dayjs.extend(localizedFormat)

/**
 * Get the version number from package.json asynchronously.
 *
 * @function
 * @returns {Promise<string>} A Promise that resolves with the version number.
 */
export const getVersionFromPackageJson = async function getVersionFromPackageJson() {
  try {
    const packageJson = await fs.promises.readFile('package.json', 'utf8')
    const packageData = JSON.parse(packageJson)
    return packageData.version
  } catch (error) {
    throw new Error('Error reading package.json or extracting version.');
  }
}

/**
 * Resolves environment variables in a given file path.
 * Supports different types of variables depending on the platform.
 *
 * For Windows, it replaces `%VARIABLE%` with its value.
 * For Linux and macOS, it replaces `$VARIABLE` with its value and `~` with the home directory.
 *
 * @param {string} filePath - The original file path which may contain environment variables.
 * @returns {string} - The file path with all environment variables resolved.
 *
 * @example
 * // For Windows
 * const filePath = '%USERPROFILE%\\some\\path'
 * const resolvedPath = resolveEnvVariablesInPath(filePath)
 *
 * // For Linux and macOS
 * const filePath = '~/some/path'
 * const resolvedPath = resolveEnvVariablesInPath(filePath)
 */
export const resolveEnvVariablesInPath = function resolveEnvVariablesInPath (filePath) {
  if (process.platform === 'win32') {
    return filePath.replace(/%([^%]+)%/g, (_, variable) => {
      return process.env[variable] || ''
    })
  } else {
    filePath = filePath.replace(/\$(\w+)/g, (_, variable) => {
      return process.env[variable] || ''
    })
    if (filePath.startsWith('~')) {
      return path.join(os.homedir(), filePath.slice(1))
    }
  }

  return filePath
}

/**
 * Formats the timestamp based on configuration.
 *
 * @param {(boolean|string)} timestampConfig - The configuration for the timestamp.
 *    If `true`, uses the standard ISO format.
 *    If `false`, returns an empty string.
 *    If a string, uses it as the date format.
 * @param {Date} timestamp - The original timestamp as a Date object.
 *
 * @returns {string} - The formatted timestamp.
 *
 * @example
 * // Returns ISO formatted timestamp
 * #formatTimestamp(new Date('2023-09-21T20:00:00.000Z'), true)
 * // Returns: '[2023-09-21T20:00:00.000Z]'
 *
 * // Returns an empty string
 * #formatTimestamp(new Date('2023-09-21T20:00:00.000Z'), false)
 * // Returns: ''
 *
 * // Returns custom formatted timestamp
 * #formatTimestamp(new Date('2023-09-21T20:00:00.000Z'), 'YYYY-MM-DD')
 * // Returns: '[2023-09-21]'
 */
export const formatTimestamp = function formatTimestamp (timestampConfig, timestamp) {
  if (timestampConfig === true) {
    return `[${timestamp.toISOString()}] `
  }

  if (timestampConfig === false) {
    return ''
  }

  if (typeof timestampConfig === 'string') {
    const formattedTimestamp = dayjs(timestamp).format(timestampConfig)
    return `[${formattedTimestamp}] `
  }

  return ''
}

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} word - The string to capitalize.
 * @returns {string} The input string with the first letter capitalized.
 */
export const capitalize = function capitalize(word) {
  if (typeof word !== 'string' || word.length === 0) return ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export const convertSystemMessageToEventData = function convertSystemMessageToEventData({ level, message }) {
  return { timestamp: new Date(), eventName: `system${capitalize(level)}`, logLevel: level, data: [level, message] }
}
