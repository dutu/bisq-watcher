/**
 * This module exports an array of Bisq-application-related rule objects.
 *
 * @see {@link ./rules.mjs} for the definition of Rule.
 * @type {Rule[]}
 */
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
    sendToTelegram: true,
    isActive: false,
  },
  {
    eventName: 'BlockchainDownloadProgressTracker',
    logger: 'o.b.c.l.DownloadProgressTracker',
    pattern: 'Downloading block chain of size {0}.',
    message: 'Synchronizing Bitcoin blockchain...',
    sendToTelegram: false,
    isActive: false,
  },
  {
    eventName: 'End of sync detected',
    logger: 'o.b.c.PeerGroup$ChainDownloadSpeedCalculator',
    pattern: 'End of sync detected at height {0}.',
    message: 'Synchronized with Bitcoin blockchain at block {0}',
    sendToTelegram: false,
    isActive: false,
  },
]
