/**
 * This module exports an array of rule objects for processing log events.
 *
 * Rules related log events are defined and imported from rules modules in this folder.
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
 * @property {'crit'|'alert'|'error'|'warning'|'info'|'notice'|'debug'} [level] - Overwrites the severity level of the original log event from Bisq log.
 * @property {boolean} [sendToTelegram] - Flag indicating whether to send the message to Telegram.
 * @property {boolean} [isActive=true] - Flag indicating whether the rule is active or not.
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

import bisqAppRules from './bisqAppRules.mjs'
import tradingRules from './tradingRules.mjs'
import disputeRules from './disputeRules.mjs'

const rules= [...bisqAppRules, ...tradingRules, ...disputeRules]
export default rules
