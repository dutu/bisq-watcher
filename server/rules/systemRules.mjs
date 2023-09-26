export default [
  {
    eventName: 'systemError',
    pattern: '',
    message: '[{0}] {1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemNotice',
    pattern: '',
    message: '[{0}] {1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'systemInfo',
    pattern: '',
    message: '[{0}] {1}',
    sendToTelegram: true,
    enabled: true,
  },
  {
    eventName: 'telegramError',
    pattern: '',
    message: '[{0}] TelegramError: {1}',
    sendToTelegram: false,
    enabled: true,
  },
]
