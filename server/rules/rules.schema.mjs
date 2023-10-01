/**
 * JSON schema for validating an array of rule objects.
 * The schema ensures that each rule object has the required properties and that
 * each property is of the correct type. This is used to validate rules for processing
 * Bisq log events.
 *
 * @type {Object}
 * @property {string} type - Specifies that the data should be an array.
 * @property {Object} items - Schema for each item (object) in the array.
 * @property {string} items.type - Specifies that each item in the array should be an object.
 * @property {Object} items.properties - Properties that can exist in each object.
 * @property {Object} items.properties.eventName - Schema for the `eventName` property.
 * @property {string} items.properties.eventName.type - Specifies that `eventName` should be a string.
 * @property {Object} items.properties.logger - Schema for the optional `logger` property.
 * @property {string} items.properties.logger.type - Specifies that `logger` should be a string.
 * @property {Object} items.properties.thread - Schema for the optional `thread` property.
 * @property {string} items.properties.thread.type - Specifies that `thread` should be a string.
 * @property {Object} items.properties.pattern - Schema for the `pattern` property.
 * @property {string} items.properties.pattern.type - Specifies that `pattern` should be a string.
 * @property {Object} items.properties.message - Schema for the `message` property.
 * @property {string} items.properties.message.type - Specifies that `message` should be a string.
 * @property {Object} items.properties.level - Schema for the optional `level` property.
 * @property {string} items.properties.level.type - Specifies that `level` should be a string.
 * @property {string[]} items.properties.level.enum - Specifies the allowed values for `level`.
 * @property {Object} items.properties.sendToTelegram - Schema for the optional `sendToTelegram` property.
 * @property {string} items.properties.sendToTelegram.type - Specifies that `sendToTelegram` should be a boolean.
 * @property {Object} items.properties.isActive - Schema for the optional `isActive` property.
 * @property {string} items.properties.isActive.type - Specifies that `isActive` should be a boolean.
 * @property {string[]} items.required - Specifies which properties are required.
 * @property {boolean} items.additionalProperties - Specifies whether additional properties are allowed.
 */
const rulesSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      eventName: { type: 'string' },
      logger: { type: 'string' },
      thread: { type: 'string' },
      pattern: { type: 'string' },
      message: { type: 'string' },
      level: {
        type: 'string',
        enum: ['crit', 'alert', 'error', 'warning', 'info', 'notice', 'debug']
      },
      sendToTelegram: { type: 'boolean' },
      isActive: { type: 'boolean' }
    },
    required: ['eventName', 'pattern', 'message'],
    additionalProperties: false
  }
}

export default rulesSchema
