export default [
  {
    eventName: 'systemError',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemNotice',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemInfo',
    pattern: '',
    message: '{0}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'telegramError',
    pattern: '',
    message: 'TelegramError: {0}',
    sendToTelegram: false,
    enabled: true,
  },
]
