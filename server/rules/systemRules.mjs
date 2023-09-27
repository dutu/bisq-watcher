export default [
  {
    eventName: 'systemError',
    pattern: '',
    message: '{1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemNotice',
    pattern: '',
    message: '{1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemInfo',
    pattern: '',
    message: '{1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'telegramError',
    pattern: '',
    message: 'TelegramError: {1}',
    sendToTelegram: false,
    enabled: true,
  },
]
