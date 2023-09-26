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
  error:  '🔺',
  warning: '🔸',
  notice: '🔹',
  info: '▫️'
}

/**
 * Color levels
 *
 * @type {{emerg: string, debug: string, crit: string, alert: string, warning: string, error: string, notice: string, info: string}}
 */
export const colors = {
  emerg: 'red',
  alert: 'yellow',
  crit: 'red',
  error: 'red',
  warning: 'orange',
  notice: 'brown',
  info: 'green',
  debug: 'blue'
}
