/**
 * Provides utilities for application configuration validation.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ajv from 'ajv'
import appConfig from '../app.config.mjs'
import appConfigSchema from '../app.config.schema.mjs'
import rules from './rules/rules.mjs'
import rulesSchema from './rules/rules.schema.mjs'

const APP_CONFIG_PATH = '../app.config.mjs'
const ajvInstance = new ajv({ strictTypes: false })

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
 * Returns:
 *    0: if no errors
 *    2: if the file does not exist
 *    3: if the file does exist, but is malformatted
 */
const validateAppConfig = function validateAppConfig() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const absolutePath = path.resolve(currentDir, APP_CONFIG_PATH)

  if (!fs.existsSync(absolutePath)) {
    console.log(`The file "app.config.mjs" does not exist at the expected location: ${absolutePath}.`)
    return 2
  }

  const validation = validateObjectAgainstSchema(appConfig, appConfigSchema)
  if (Array.isArray(validation)) {
    console.log(`Invalid app.config.mjs:\n${JSON.stringify(validation, null, 2)}`)
    return 3
  }

  return 0
}

/**
 * Validates rules structure.
 * Returns:
 *    0: if no errors
 *    4: if any rule is malformatted
 */
const validateRules = function validateRules() {
  const validation = validateObjectAgainstSchema(rules, rulesSchema)
  if (Array.isArray(validation)) {
    console.log(`Invalid rules.mjs:\n${JSON.stringify(validation, null, 2)}`)
    return 4
  }

  return 0
}

const validateConfiguration = function validateConfiguration() {
  let returnCode = validateAppConfig()
  if (returnCode > 0) {
    return returnCode
  }

  returnCode = validateRules()
  return  returnCode
}

export default validateConfiguration
