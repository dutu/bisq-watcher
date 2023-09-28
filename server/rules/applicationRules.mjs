
export default [
  {
    eventName: 'BisqStarting',
    logger: 'b.c.app.Version',
    pattern: 'Version: Version{VERSION={0},',
    message: 'Bisq v{0} starting',
    sendToTelegram: true
  },
  {
    eventName: 'BisqShutdownCompleted',
    logger: 'b.c.a.BisqExecutable',
    pattern: 'Graceful shutdown completed. Exiting now.',
    message: 'Bisq graceful shutdown completed',
    sendToTelegram: true
  },
  {
    eventName: 'walletInitialized_p2pNetWorkReady',
    logger: 'b.c.a.BisqSetup',
    pattern: 'walletInitialized=true, p2pNetWorkReady=true',
    message: 'Wallet initialized and P2P network ready',
    sendToTelegram: true
  },
  {
    eventName: 'MobileNotificationService: Send message',
    logger: 'b.c.n.MobileNotificationService',
    pattern: "MobileNotificationService: Send message: '{0}'",
    message: '{0}',
    sendToTelegram: true
  },
]
