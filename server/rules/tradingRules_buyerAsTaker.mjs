import { tradingRules as tradingRules_sellerAsMaker } from './tradingRules_sellerAsMaker.mjs'

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
export const tradingRules =  [
  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'BuyerAsTakerTrade_BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    message: '({0}) You got a new trade with ID {0}. Deposit transaction is published. Wait for blockchain confirmation!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'BuyerAsTakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    message: '({0}) Deposit transaction is confirmed. Open your Bisq application and start the payment',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 3. Phase FIAT_PAYMENT_INITIATED
   */
  {
    eventName: 'BuyerAsTakerTrade_BUYER_STORED_IN_MAILBOX_FIAT_PAYMENT_INITIATED_MSG',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_STORED_IN_MAILBOX_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) You confirmed fiat payment has started. Wait until payment has arrived!',
    sendToTelegram: true,
    enabled: true,
  },


  /**
   *  phase FIAT_SENT
   */

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'BuyerAsTakerTrade_BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    message: '({0}) The trade is completed.',
    sendToTelegram: true,
    enabled: true,
  },
]