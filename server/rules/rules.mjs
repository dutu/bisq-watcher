/**
 * This file exports an array of rule objects for processing log events.
 *
 * Rules for trading related log events are defined and imported from './tradingRules.mjs'
 * Rules for Bisq application log events are defined and imported './applicationRules.mjs'
 *
 * @typedef {Object} Rule
 *
 * @property {string} eventName - The name of the custom event to emit when a match is found.
 * @property {string} [logger] - The origin logger of the Bisq log event.
 * @property {string} [thread] - The origin thread of the Bisq log event.
 * @property {string} pattern - The string pattern to match against the Bisq log event. Variables can
 *   be extracted using placeholders like {0}, {1}, etc.
 * @property {string} message - A template string for formatting the message to emit.
 *   Use `{index}` as a placeholder for extracted variables.
 *   Use '{*}' as a placeholder for the entire match.
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'debug'} [level='info'] - Overwrites the severity level of the original log event from Bisq log.
 * @property {boolean} [sendToTelegram] - Flag indicating whether to send the message to Telegram.
 * @property {boolean} [disabled=false] - Flag indicating whether the rule is active or not.
 *
 * @example
 * {
 *   eventName: 'myOfferTaken',
 *   logger: 'b.c.n.a.MyOfferTakenEvents',
 *   pattern: 'MyOfferTakenEvents: We got a offer removed. id={0}-',
 *   message: '({0}) Your offer with ID {0} was taken.',
 *   level: 'notice',
 *   sendToTelegram: true,
 *   disabled: true,
 * }
 */

import applicationRules from './applicationRules.mjs'
import tradingRules from './tradingRules.mjs'

const rules= [...applicationRules, ...tradingRules]
export default rules
