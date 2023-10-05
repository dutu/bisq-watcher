/**
 * Definitions of levels for logging purposes & shareable Symbol constants.
 */


/**
 * Levels for the syslog configuration
 *
 * @type {{emerg: string, debug: string, rapport: string, crit: string, alert: string, warning: string, error: string, notice: string, info: string}}
 */
export const levels = {
  emerg: 'emerg',
  alert: 'alert',
  crit: 'crit',
  error: 'error',
  warning: 'warning',
  notice: 'notice',
  info: 'info',
  debug: 'debug',
}

/**
 * Icons levels can be used for telegram messages, etc
 *
 * @type {{warning: string, error: string, notice: string, info: string}}
 */
export const icons = {
  emerg:'🛑',
  alert: '🚨',
  crit: '💥',
  error: '❗️',
  warning: '⚠️',
  notice: '🔶',
  info: '💡',
  debug: '🔍',
}

/**
 * Color levels
 *
 * @type {{emerg: string, debug: string, crit: string, alert: string, warning: string, error: string, notice: string, info: string}}
 */
export const colors = {
  emerg: 'bold red yellowBG',
  alert: 'red yellowBG',
  crit: 'bold red',
  error: 'red',
  warning: 'magenta',
  notice: 'yellow',
  info: 'green',
  debug: 'dim blue'
}
