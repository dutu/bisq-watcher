import { tradingRules as tradingRules_sellerAsMaker } from './tradingRules_sellerAsMaker.mjs'
import { tradingRules as tradingRules_sellerAsTaker } from './tradingRules_sellerAsTaker.mjs'
import { tradingRules as tradingRules_buyerAsMaker } from './tradingRules_buyerAsMaker.mjs'
import { tradingRules as tradingRules_buyerAsTaker } from './tradingRules_buyerAsTaker.mjs'

/**
 * Array of rule objects for processing log events.
 *
 * @type {Array.<Object>}
 *
 * @property {string} [eventName] - The name of the custom event to emit when a match is found.
 * @property {string} [logger] - The origin logger of the log event.
 * @property {string} [thread] - The origin thread of the log event.
 * @property {string} pattern - The string pattern to match against the log event. Variables can
 *   be extracted using placeholders like {0}, {1}, etc.
 * @property {string} message - A template string for formatting the message to emit.
 *   Use `{index}` as a placeholder for extracted variables.
 *   Use '{*}' as a placeholder for the entire match.
 * @property {boolean} [sendToTelegram] - Flag indicating whether to send the log event to Telegram.
 * @property {boolean} [enabled] - Flag indicating whether the rule is active or not.
 *
 * @example
 * {
 *   eventName: 'myOfferTaken',
 *   logger: 'b.c.n.a.MyOfferTakenEvents',
 *   pattern: 'MyOfferTakenEvents: We got a offer removed. id={0}-',
 *   message: '({0}) Your offer with ID {0} was taken.',
 *   sendToTelegram: true,
 *   enabled: true,
 * }
 */
const tradingRules_common =  [
  {
    eventName: 'myOfferTaken',
    logger: 'b.c.n.a.MyOfferTakenEvents',
    pattern: 'MyOfferTakenEvents: We got a offer removed. id={0}-',
    message: `({0}) Your offer with ID {0} was taken.`,
    sendToTelegram: true,
    enabled: true,
  },
/*
  {
    eventName: 'TradeEvents: We got a new trade',
    logger: 'b.c.n.a.TradeEvents',
    pattern: 'We got a new trade. id={0}-',
    message: `({0}) New trade with ID {0}`,
    sendToTelegram: true
  },
*/
]

const tradingRules = [
  ...tradingRules_common,
  ...tradingRules_sellerAsMaker,
  ...tradingRules_sellerAsTaker,
  ...tradingRules_buyerAsMaker,
  ...tradingRules_buyerAsTaker
]

export default tradingRules
