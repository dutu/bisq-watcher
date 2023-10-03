import crypto from 'node:crypto'

/**
 * EventCache class for tracking and storing events.
 * Extends the native Set class.
 */
class EventCache extends Set {
  #useHash
  #maxEvents

  /**
   * Constructs an EventCache object.
   * @param {Object} options - Configuration options.
   * @param {boolean} [options.useHash=false] - Whether to store the events as hashes.
   * @param {number} [options.maxEvents] - The maximum number of events to store. If not set, no limit is applied.
   *
   * @example
   * const eventCache = new EventCache({ useHash: true, maxEvents: 100 })
   */
  constructor({ useHash = false, maxEvents } = {}) {
    super()
    this.#useHash = useHash
    this.#maxEvents = maxEvents
  }

  /**
   * Generate a SHA-256 hash for a given event.
   * @private
   * @param {string} event - The event to hash.
   * @returns {string} - The hash of the event.
   */
  #hashEvent(event) {
    return crypto.createHash('sha256').update(event).digest('hex')
  }

  /**
   * Override the native Set `add` method.
   * Adds an event to the cache.
   * Automatically removes the oldest event if the size exceeds maxEvents.
   * @param {string} event - The event to add.
   * @returns {EventCache} - The updated cache.
   *
   * @example
   * const cache = new EventCache({ useHash: true, maxEvents: 100 })
   * cache.add('This is a log event')
   */
  add(event) {
    if (this.#maxEvents !== undefined && this.size >= this.#maxEvents) {
      this.delete(this.values().next().value)
    }

    const item = this.#useHash ? this.#hashEvent(event) : event
    return super.add(item)
  }

  /**
   * Override the native Set `has` method.
   * Checks for the presence of an event in the cache.
   * @param {string} event - The event to check for.
   * @returns {boolean} - Whether the event exists in the cache.
   *
   * @example
   * const cache = new EventCache({ useHash: true, maxEvents: 100 })
   * cache.add('This is a log event')
   * cache.has('This is a log event') // returns true
   */
  has(event) {
    const item = this.#useHash ? this.#hashEvent(event) : event
    return super.has(item)
  }

  /**
   * Override the native Set `delete` method.
   * Deletes an event from the cache.
   * @param {string} event - The event to delete.
   * @returns {boolean} - Whether the event was successfully deleted.
   *
   * @example
   * const cache = new EventCache({ useHash: true, maxEvents: 100 })
   * cache.add('This is a log event')
   * cache.delete('This is a log event') // returns true
   */
  delete(event) {
    const item = this.#useHash ? this.#hashEvent(event) : event
    return super.delete(item)
  }
}

export default EventCache
