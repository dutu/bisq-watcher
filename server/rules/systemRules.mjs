/**
 * This file exports an array of system rule objects.
 */

export default [
  {
    eventName: 'systemCrit',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
  },
  {
    eventName: 'systemAlert',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
  },
  {
    eventName: 'systemError',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
  },
  {
    eventName: 'systemNotice',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
  },
  {
    eventName: 'systemInfo',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
  },
  {
    eventName: 'systemDebug',
    logger: 'system',
    pattern: '',
    message: '{0}',
    sendToTelegram: false,
  },
  {
    eventName: 'telegramError',
    logger: 'telegram',
    pattern: '',
    message: 'TelegramError: {0}',
    sendToTelegram: false,
  },
]
