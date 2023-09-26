import EventEmitter from 'eventemitter3'
import TelegramBot from 'node-telegram-bot-api'
import { icons as logIcons } from './syslog.mjs'

export default class Telegram extends EventEmitter {
  #config
  #telegramBot

  constructor(configTelegram) {
    super()
    this.#config = configTelegram
  }

  /**
   * Sends a message to all configured chat ids on Telegram with a specific icon based on the level of the message.
   *
   * @param {Object} params - An object that contains the level and message to be sent.
   * @param {('error'|'warning'|'notice'|'info')} params.level - The level of the message.
   * @param {string} params.message - The message to be sent.
   */
  async sendMessage({ level, message }) {
    for(const chatId of this.#config.chatIds) {
      await this.#telegramBot.sendMessage(chatId, `${logIcons[level]} ${message}`)
    }
  }

  start() {
    this.#telegramBot = new TelegramBot(this.#config.apiToken, { polling: true })
    this.#telegramBot.on('polling_error', (error) => {
      this.emit('error', error)  // => 'EFATAL'
    });

    this.#telegramBot.on('error', (error) => this.emit('error', error))
    this.#telegramBot.onText(/\/start/, msg => {
      const userId = msg.from.id
      const name = msg.from.first_name || msg.from.username
      this.#telegramBot.sendMessage(userId, `Hello ${name}!\nWelcome to xwbsqt_bot!`)
      this.#telegramBot.sendMessage(userId, 'Notifications are now active.')
    })
  }
}
