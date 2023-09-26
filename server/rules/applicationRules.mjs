
export default [
  {
    eventName: 'startingBisq',
    pattern: 'Version: Version{VERSION={0},',
    message: 'Starting Bisq Version {0}',
    sendToTelegram: true
  },
  {
    eventName: 'walletInitialized_p2pNetWorkReady',
    pattern: 'walletInitialized={0}, p2pNetWorkReady={1}',
    message: 'Wallet initialized = {0}, p2p network ready = {1}',
    sendToTelegram: true
  },
  {
    eventName: 'MobileNotificationService: Send message',
    pattern: "MobileNotificationService: Send message: '{0}'",
    message: '{0}',
    sendToTelegram: true
  },
]
