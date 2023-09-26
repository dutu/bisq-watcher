import EventEmitter from 'eventemitter3'
import Transport from 'winston-transport'
import TelegramBot from 'node-telegram-bot-api'

/**
 * TelegramTransport class for Winston logger.
 *
 * @example
 * const config = {
 *   apiToken: 'YOUR_TELEGRAM_BOT_TOKEN',
 *   chatIds: ['CHAT_ID_1', 'CHAT_ID_2']
 * }
 * const telegramTransport = new TelegramTransport(config)
 */
export class TelegramTransport extends Transport {
  #config
  #telegramBot
  eventEmitter = new EventEmitter()

  /**
   * Creates an instance of TelegramTransport.
   *
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    super(config)
    this.#config = config
    this.#telegramBot = new TelegramBot(this.#config.apiToken, { polling: true })
    this.#telegramBot.on('polling_error', (error) => {
      this.eventEmitter.emit('error', error)
    })
    this.#telegramBot.on('error', (error) => {
      this.eventEmitter.emit('error', error)
    })
    this.#initializeListeners()
  }

  /**
   * Initializes the Telegram bot listeners.
   *
   * @private
   */
  #initializeListeners() {
    this.#telegramBot.onText(/\/start/, (msg) => {
      const userId = msg.from.id
      const name = msg.from.first_name || msg.from.username
      this.#telegramBot.sendMessage(userId, `Hello ${name}!\nBot started.`)
      this.#telegramBot.sendMessage(userId, 'Notifications are now active.')
    })

    this.#telegramBot.onText(/\/status/, (msg) => {
      const chatId = msg.chat.id
      this.#telegramBot.sendMessage(chatId, 'Bot is up and running.')
    })
  }

  /**
   * Logs a message to Telegram.
   *
   * @param {Object} info - Information to log
   * @param {Function} callback - Callback function
   * @example
   * telegramTransport.log({ message: 'Hello, world!' }, () => {
   *   console.log('Message logged')
   * })
   */
  log(info, callback) {
    if (info.meta?.sendToTelegram === false) {
      callback()
      return
    }

    const promises = this.#config.chatIds.map((chatId) => {
      return this.#telegramBot.sendMessage(chatId, `${info.message}`)
    })

    Promise.all(promises)
      .then(() => {
        callback()
      })
      .catch((err) => {
        this.eventEmitter.emit('error', err)
      })
  }
}
