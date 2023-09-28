export const tradingRules =  [
/*
  // For debugging only
  {
    eventName: 'BuyerAsTakerTrade',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'BuyerAsTakerTrade',
    message: '{*}',
    sendToTelegram: true,
    enabled: false,
  },
*/

  {
    eventName: 'SellerAsTakerTrade_TAKER_PUBLISHED_TAKER_FEE_TX',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): TAKER_PUBLISHED_TAKER_FEE_TX',
    message: '({0}) New trade with ID {0}.',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'BuyerAsTakerTrade_BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_RECEIVED_DEPOSIT_TX_PUBLISHED_MSG',
    message: '({0}) Deposit transaction has been published. Wait for blockchain confirmation!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'BuyerAsTakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    logger: 'b.c.t.m.b.Trade',
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
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_STORED_IN_MAILBOX_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) You confirmed fiat payment has started. Wait until payment has arrived!',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'BuyerAsMakerTrade_BUYER_SENT_FIAT_PAYMENT_INITIATED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_SENT_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) You confirmed fiat payment has started. Wait until payment has arrived!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'BuyerAsTakerTrade_BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at BuyerAsTakerTrade (id={0}): BUYER_RECEIVED_PAYOUT_TX_PUBLISHED_MSG',
    message: '({0}) The trade is completed.',
    sendToTelegram: true,
    enabled: true,
  },
]
