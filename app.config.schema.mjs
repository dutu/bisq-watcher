/**
 * @description This module defines the JSON schema for validating the main application configuration.
 *
 * @typedef {Object} configSchema
 * @property {Object} type - Specifies that the configuration should be an object.
 * @property {Object} properties - Defines the properties of the configuration.
 * @property {Object} properties.name - The name of the watcher.
 * @property {Object} properties.logFile - The location of the Bisq log file for the watcher.
 * @property {Object} properties.transports - The configuration for the array of transport objects.
 *   At least one transport object must be defined.
 * @property {Object} properties.debug - The debug configurations for the watcher.
 * @property {Object} properties.overwriteRules - The configuration for the array of overwrite rules.
 * @property {Array} required - An array specifying which properties are required.
 */

const configSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    logFile: { type: 'string' },
    transports: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          type: { enum: ['console', 'telegram', 'file'] },
          apiToken: { type: 'string' },
          chatIds: {
            type: 'array',
            items: { type: 'string' }
          },
          file: { type: 'string' },
          timestamp: {
            type: ['boolean', 'string']
          },
          level: { enum: ['crit', 'alert', 'error', 'warning', 'info', 'notice', 'debug'] },
          disabled: { type: 'boolean' },
          overwriteRules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                eventName: { type: 'string' },
                message: { type: 'string' },
                level: { enum: ['crit', 'alert', 'error', 'warning', 'info', 'notice', 'debug'] },
                sendToTelegram: { type: 'boolean' },
                activation: { enum: ['active', 'inactive'] }
              },
              required: ['eventName']
            }
          }
        }
      },
      allOf: [
        {
          if: { properties: { type: { enum: ['telegram'] } } },
          then: { required: ['apiToken', 'chatIds'] }
        },
        {
          if: { properties: { type: { enum: ['file'] } } },
          then: { required: ['file'] }
        }
      ]
    },
    debug: {
      type: 'object',
      properties: {
        atStartBuildEventCacheOnly: { type: 'boolean' },
        overlappingGoBackNPositions: { type: 'number' },
        useHash: { type: 'boolean' }
      }
    },
    overwriteRules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eventName: { type: 'string' },
          message: { type: 'string' },
          level: { enum: ['crit', 'alert', 'error', 'warning', 'info', 'notice', 'debug'] },
          sendToTelegram: { type: 'boolean' },
          activation: { enum: ['active', 'inactive'] }
        },
        required: ['eventName']
      }
    }
  },
  required: ['logFile', 'transports']
}

export default configSchema
