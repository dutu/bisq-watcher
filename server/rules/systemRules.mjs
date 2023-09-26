export default [
  {
    eventName: 'systemInfo',
    pattern: '',
    message: '[{0}] {1}',
    sendToTelegram: true
  },
  {
    eventName: 'systemError',
    pattern: '',
    message: '[{0}] {1}',
    sendToTelegram: true
  },
  {
    eventName: 'telegramError',
    pattern: '',
    message: '[{0}] TelegramError: {1}',
    sendToTelegram: false
  },
]
