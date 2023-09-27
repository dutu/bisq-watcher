export const tradingRules = [
  {
    eventName: 'SellerAsMakerTrade',
    pattern: 'SellerAsMakerTrade',
    message: '{*}',
    sendToTelegram: true
  },

  {
    eventName: 'myOfferTaken',
    pattern: 'MyOfferTakenEvents: We got a offer removed. id={0:uptoHyphen}, state=RESERVED',
    message: `({0}) Your offer with ID {0} was taken.`,
    sendToTelegram: true
  },

  /**
   * Step 1. Phase DEPOSIT_PAID
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_PUBLISHED_DEPOSIT_TX',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_PUBLISHED_DEPOSIT_TX',
    message: '({0}) Deposit transaction is published. Wait for blockchain confirmation!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 2. Phase DEPOSIT_CONFIRMED
   */
  {
    eventName: 'SellerAsMakerTrade_DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): DEPOSIT_CONFIRMED_IN_BLOCK_CHAIN',
    message: '({0}) Deposit transaction is confirmed. Wait until payment has started!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 3. Phase FIAT_PAYMENT_INITIATED
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_RECEIVED_FIAT_PAYMENT_INITIATED_MSG',
    message: '({0}) BTC buyer has started the payment. Confirm payment received!',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   *  phase FIAT_SENT
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    pattern: 'Set new state at SellerAsMakerTrade (id={0}): SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    message: '({0}) You confirmed fiat payment receipt.',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'SellerAsTakerTrade_SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    pattern: 'Set new state at SellerAsTakerTrade (id={0}): SELLER_CONFIRMED_IN_UI_FIAT_PAYMENT_RECEIPT',
    message: '({0}) You confirmed fiat payment receipt.',
    sendToTelegram: true,
    enabled: true,
  },

  /**
   * Step 4. Phase PAYOUT_TX_PUBLISHED
   */
  {
    eventName: 'SellerAsMakerTrade_SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG',
    pattern: `Set new state at SellerAsMakerTrade (id={0}): SELLER_SENT_PAYOUT_TX_PUBLISHED_MSG`,
    message: 'The trade with ID {0} is completed',
    sendToTelegram: true
  },
]
