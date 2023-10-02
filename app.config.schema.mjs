/**
 * @file app.config.schema.mjs
 * @description This module defines the JSON schema for validating the main application configuration.
 *
 * @typedef {Object} configSchema
 * @property {Object} type - Specifies that the configuration should be an object.
 * @property {Object} properties - Defines the properties of the configuration.
 * @property {Object} properties.watchers - The configuration for the array of watchers.
 * @property {Array} properties.watchers.items - Specifies each watcher configuration object.
 * @property {Object} properties.watchers.items.properties - The properties of each watcher.
 * @property {Object} properties.watchers.items.properties.name - The name of the watcher.
 * @property {Object} properties.watchers.items.properties.logFile - The location of the Bisq log file for the watcher.
 * @property {Object} properties.watchers.items.properties.transports - The configuration for the array of transport objects.
 * @property {Object} properties.watchers.items.properties.debug - The debug configurations for the watcher.
 * @property {Object} properties.watchers.items.properties.overwriteRules - The configuration for the array of overwrite rules.
 * @property {Array} required - An array specifying which properties are required.
 */

const configSchema = {
  type: 'object',
  properties: {
    watchers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          logFile: { type: 'string' },
          transports: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { enum: ['console', 'telegram', 'file'] },
                apiToken: { type: 'string' },
                chatIds: {
                  type: 'array',
                  items: { type: 'string' }
                },
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
            }
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
    }
  },
  required: ['watchers']
}

export default configSchema
