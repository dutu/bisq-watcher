/**
 * This file exports an array of trading-related rule objects.
 *
 * @see {@link ./rules.mjs} for the definition of Rule.
 * @type {Rule[]}
 */

import { tradingRules as tradingRules_sellerAsMaker } from './tradingRules_sellerAsMaker.mjs'
import { tradingRules as tradingRules_sellerAsTaker } from './tradingRules_sellerAsTaker.mjs'
import { tradingRules as tradingRules_buyerAsMaker } from './tradingRules_buyerAsMaker.mjs'
import { tradingRules as tradingRules_buyerAsTaker } from './tradingRules_buyerAsTaker.mjs'

const tradingRules_common =  [
  {
    eventName: 'myOfferTaken',
    logger: 'b.c.n.a.MyOfferTakenEvents',
    pattern: 'MyOfferTakenEvents: We got a offer removed. id={0}-',
    message: `({0}) Your offer with ID {0} was taken`,
    level: 'notice',
    sendToTelegram: true,
    isActive: true,
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
