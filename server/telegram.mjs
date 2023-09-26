import EventEmitter from 'eventemitter3'
import TelegramBot from 'node-telegram-bot-api'
import { icons as logIcons, levels as ll } from '../../utils/syslog.mjs'

export class Telegram extends EventEmitter {
  #config
  #telegramBot
  constructor(configTelegram) {
    super()
    this.#config = configTelegram
  }

  #log( { level, message }) {
    this.emit('log', { level, message })
  }

  /**
   * Sends a message to all configured chat ids on Telegram with a specific icon based on the level of the message.
   *
   * @private
   * @method #sendTele
   * @param {Object} param0 - An object that contains the level and message to be sent.
   * @param {('error'|'warning'|'notice'|'info')} param0.level - The level of the message.
   * @param {string} param0.message - The message to be sent.
   * */
  sendMessage({ level, message }) {
    for(const chatId of this.#config.chatIds) {
      this.#telegramBot.sendMessage(chatId, `${logIcons[level]}${message}`)
    }
  }

  /**
   * Initializes and starts the TelegramBot  instance with the configured API token.
   * On start, sends an 'INFO' level message stating that the bot is starting up.
   * Logs warnings if there are any errors with the bot.
   *
   * On receiving a '/start' command, the bot sends a welcome message to the user
   *
   * @private
   * @method #startTelebot
   * @returns {Promise} Returns a promise that will resolve when the bot starts successfully.
   */
  start() {
    this.#telegramBot = new TelegramBot (this.#config.apiToken, { polling: true })
    this.#telegramBot.on('error', (error) => this.#log({ level: ll.warning, message: error }))
    this.#telegramBot.onText(/\/start/, msg => {
      let userId = msg.from.id
      let name = msg.from.first_name || msg.from.username
      this.#telegramBot.sendMessage(userId, `Hello ${name}!\nWelcome to xwbsqt_bot!`)
      this.#telegramBot.sendMessage(userId, `Notifications are now active`)
    })
  }
}
