
export const tradingRules =  [

  {
    eventName: 'SellerAsTakerTrade',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'SellerAsTakerTrade',
    message: '{*}',
    sendToTelegram: true
  },


  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'SellerAsTakerTrade_SELLER_PUBLISHED_DEPOSIT_TX',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsTakerTrade (id={0}): SELLER_PUBLISHED_DEPOSIT_TX',
    message: '({0}) You got a new trade with ID {0}. Deposit transaction is published. Wait for blockchain confirmation!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'SellerAsTakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsTakerTrade (id={0}): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    message: '({0}) Deposit transaction is confirmed. Wait until payment has started!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 3. Phase FIAT_PAYMENT_INITIATED
   */
  {
    eventName: 'SellerAsTakerTrade_SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsTakerTrade ({0}): SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) BTC buyer has started the payment. Confirm payment received!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   *  phase FIAT_SENT
   */
  {
    eventName: 'SellerAsTakerTrade_SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsTakerTrade (id={0}): SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    message: '({0}) You confirmed fiat payment receipt.',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'SellerAsTakerTrade_SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsTakerTrade (id={0}): SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG',
    message: '({0}) The trade is completed',
    sendToTelegram: true
  },
]
