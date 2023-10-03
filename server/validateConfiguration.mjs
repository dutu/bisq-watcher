/**
 * Provides utilities for application configuration validation.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ajv from 'ajv'
import appConfigSchema from '../app.config.schema.mjs'
import rules from './rules/rules.mjs'
import rulesSchema from './rules/rules.schema.mjs'
import { pathToFileURL } from 'url'

const ajvInstance = new ajv({ strictTypes: false })

/**
 * Represents errors related to the application configuration.
 * This custom error class extends the native JavaScript Error class.
 * It includes an additional property for exit codes.
 *
 * @extends {Error}
 *
 * @example
 * try {
 *   throw new AppConfigError('An error occurred.', 1)
 * } catch (error) {
 *   if (error instanceof AppConfigError) {
 *     console.error(error.message)
 *     process.exit(error.exitCode)
 *   }
 * }
 */
export class AppConfigError extends Error {
  /**
   * Creates an instance of AppConfigError.
   *
   * @param {string} message - The error message.
   * @param {number} exitCode - The exit code for the application.
   */
  constructor(message, exitCode) {
    super(message)
    this.name = 'AppConfigError'
    this.exitCode = exitCode
  }
}

/**
 * Parses command-line arguments to find the path of a configuration file.
 *
 * @example
 * // Run the script with: node script.js --name example --config path/to/config
 * findConfigFilePath() // Returns 'path/to/config'
 *
 * // Run the script with: node script.js --name example
 * findConfigFilePath() // Returns undefined
 *
 * @returns {string|undefined} The path to the config file or undefined if not specified.
 */
const findConfigFilePath = function findConfigFilePath()  {
  const args = process.argv.slice(2)
  let configFilePath

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config') {
      configFilePath = args[i + 1]
      break
    }
  }

  return configFilePath
}

/**
 * Validates an object against a given schema.
 *
 * @param {Object} object - The object to validate.
 * @param {Object} validationSchema - The schema to validate against.
 * @returns {true | string[]} An array of validation error messages. Returns true if valid.
 */
const validateObjectAgainstSchema = function validateObjectAgainstSchema(object, validationSchema) {
  const compileSchema = ajvInstance.compile(validationSchema)
  const isValid = compileSchema(object)

  if (isValid) {
    return true
  }

  return compileSchema.errors.map(error => {
    const errorMessage = `${error.instancePath} ${error.message}`
    const additionalInfo = Object.entries(error.params)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    return `Error: ${errorMessage}. Additional Info: ${additionalInfo}`
  })
}

/**
 * Validates the existence and structure of the application configuration file.
 *
 * @param {string} configFilePath - The relative or absolute path to the config file.
 * @returns {Promise<Object>} - Returns the valid appConfig object.
 * @throws {AppConfigError} - Throws an error if the file does not exist or is malformatted.
 */
const validateAppConfig = async function(configFilePath){
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const absolutePath = path.resolve(path.dirname(currentDir), configFilePath)

  try {
    await fs.promises.access(absolutePath)
  } catch (error) {
    throw new AppConfigError(`The configuration file ${configFilePath} does not exist at the expected location: ${absolutePath}.`, 2)
  }

  const urlForImport = pathToFileURL(absolutePath).href
  let appConfig
  try {
    const module = await import(urlForImport)
    appConfig = module.default
  } catch (error) {
    throw new AppConfigError(`Invalid syntax or unable to import configuration file ${configFilePath}: ${error}`, 3)
  }

  const validation = validateObjectAgainstSchema(appConfig, appConfigSchema)
  if (Array.isArray(validation)) {
    throw new AppConfigError(`Invalid configuration file ${configFilePath}:\n${JSON.stringify(validation, null, 2)}`, 3)
  }

  return appConfig
}

/**
 * Validates rules structure.
 *
 * @throws {AppConfigError} - Throws an error if any rule is malformatted.
 *
 * @example
 * try {
 *   validateRules()
 *   console.log('Rules are valid.')
 * } catch (error) {
 *   if (error instanceof AppConfigError) {
 *     console.error('Rules are invalid.', error)
 *     process.exit(error.exitCode)
 *   }
 * }
 */
const validateRules = function() {
  const validation = validateObjectAgainstSchema(rules, rulesSchema)
  if (Array.isArray(validation)) {
    throw new AppConfigError(`Invalid rules.mjs:\n${JSON.stringify(validation, null, 2)}`, 4)
  }
}

/**
 * Validates the application configuration and rules.
 *
 * @returns {Promise<Object>} - Returns the valid appConfig object.
 * @throws {AppConfigError} - Propagates errors related to either app config or rules.
 *
 * @example
 * try {
 *   const appConfig = await validateConfiguration()
 *   console.log('All configurations are valid.', appConfig)
 * } catch (error) {
 *   if (error instanceof AppConfigError) {
 *     console.error('Configuration or rules are invalid.', error)
 *     process.exit(error.exitCode)
 *   }
 * }
 */
export const validateConfiguration = async function() {
  const configFilePath = findConfigFilePath()
  try {
    const appConfig = await validateAppConfig(configFilePath)
    validateRules()
    return appConfig
  } catch (error) {
    // If the error is an instance of AppConfigError, re-throw it for handling at a higher level.
    if (error instanceof AppConfigError) {
      throw error
    }
    // For any other kinds of errors
    throw error
  }
}
