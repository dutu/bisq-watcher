export const tradingRules = [
  {
    eventName: '4311643',
    pattern: '4311643',
    message: '{*}',
    sendToTelegram: true
  },

  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_PUBLISHED_DEPOSIT_TX',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_PUBLISHED_DEPOSIT_TX',
    message: '({0}) Deposit transaction has been published. Wait for blockchain confirmation!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'SellerAsMakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    message: '({0}) Deposit transaction is confirmed. Wait until BTC buyer starts the payment!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 3. Phase FIAT_PAYMENT_INITIATED
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) BTC buyer has started the payment. Check that you have received the payment, then confirm payment receipt!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   *  phase FIAT_SENT
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    logger: 'b.c.t.m.b.Trade',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    message: '({0}) You confirmed that you have received the payment.',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG',
    logger: 'b.c.t.m.b.Trade',
    pattern: `Set new state at SellerAsMakerTrade (id={0}): SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG`,
    message: '({0}) The trade is completed.',
    sendToTelegram: true
  },
]
