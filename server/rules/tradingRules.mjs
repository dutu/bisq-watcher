import { tradingRules as tradingRules_sellerAsMaker } from './tradingRules_sellerAsMaker.mjs'
import { tradingRules as tradingRules_sellerAsTaker } from './tradingRules_sellerAsTaker.mjs'

/**
 * Array of rule objects for processing log events.
 *
 * @type {Array.<Object>}
 *
 * @property {RegExp} pattern - The RegExp pattern to match against the log event.
 * @property {string} eventName - The name of the custom event to emit when a match is found.
 * @property {string} message - A template string for formatting the message to emit. Use
 *   `{index}` as a placeholder for capture groups from the RegExp pattern.
 * @property {boolean} sendToTelegram - Flag indicating whether to send the log event to Telegram.
 *
 * @example
 * {
 *   eventName: 'handlePriceUpdate',
 *   pattern: /Price at take-offer time: id=(.*), currency=(.*), takersPrice=(\d+), makersPrice=(\d+), deviation=(.*)%/,
 *   message: 'Price at take-offer: ID={0}, Currency={1}, Takers Price={2}, Makers Price={3}, Deviation={4}%',
 *   sendToTelegram: true
 * }
 */

const tradingRules_common =  [
  {
    eventName: 'myOfferTaken',
    logger: 'b.c.n.a.MyOfferTakenEvents',
    pattern: 'MyOfferTakenEvents: We got a offer removed. id={0:uptoHyphen}, state=RESERVED',
    message: `({0}) Your offer with ID {0} was taken`,
    sendToTelegram: true
  },
/*
  {
    eventName: 'TradeEvents: We got a new trade',
    pattern: 'TradeEvents: We got a new trade. id={0}-',
    message: `({0}) New trade with ID {0}`,
    sendToTelegram: true
  },
*/
]

const tradingRules = [...tradingRules_common, ...tradingRules_sellerAsTaker]

export default tradingRules
