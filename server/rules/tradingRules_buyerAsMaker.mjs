/**
 * This module exports an array of trading-related rule objects.
 *
 * @see {@link ./rules.mjs} for the definition of Rule.
 * @type {Rule[]}
 */

export const tradingRules = [
/*
  // For debugging only
  {
    eventName: 'BuyerAsMakerTrade',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'BuyerAsMakerTrade',
    message: '{*}',
    sendToTelegram: true,
    disabled: true,
  },
*/

  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'BuyerAsMakerTrade_BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    message: '({0}) Deposit transaction has been published. Wait for blockchain confirmation!',
    level: 'notice',
    sendToTelegram: true,
  },
  {
    eventName: 'BuyerAsMakerTrade_BUYER_SAW_DEPOSIT_TX_IN_NETWORK',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): BUYER_SAW_DEPOSIT_TX_IN_NETWORK',
    message: '({0}) Deposit transaction has been published. Wait for blockchain confirmation!',
    level: 'notice',
    sendToTelegram: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'BuyerAsMakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    message: '({0}) Deposit transaction is confirmed. Open your Bisq application and start the payment!',
    level: 'notice',
    sendToTelegram: true,
  },

  /**
   * Step 3. Phase FIAT_PAYMENT_INITIATED
   */
  {
    eventName: 'BuyerAsMakerTrade_BUYER_STORED_IN_MAILBOX_FIAT_PAYMENT_INITIATED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): BUYER_STORED_IN_MAILBOX_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) You confirmed fiat payment has started. Wait until payment has arrived!',
    level: 'notice',
    sendToTelegram: true,
  },
  {
    eventName: 'BuyerAsMakerTrade_BUYER_SENT_FIAT_PAYMENT_INITIATED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: ' Set new state at BuyerAsMakerTrade (id={0}): BUYER_SENT_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) You confirmed fiat payment has started. Wait until payment has arrived!',
    level: 'notice',
    sendToTelegram: true,
  },

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'BuyerAsMakerTrade_BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    message: '({0}) The trade is completed.',
    level: 'notice',
    sendToTelegram: true,
  },
  {
    eventName: 'BuyerAsMakerTrade_BUYER_SAW_PAYOUT_TX_IN_NETWORK',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsMakerTrade (id={0}): BUYER_SAW_PAYOUT_TX_IN_NETWORK',
    message: '({0}) The trade is completed.',
    level: 'notice',
    sendToTelegram: true,
  },
]
