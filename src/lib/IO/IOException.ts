/**
 * @classdesc The exception that is throw when an I/O error occurs.
 * @extends [[Error]]
 */
export default class IOException extends Error {
  /**
   * Initializes a new instance of the jsrpi.IO.IOException with a message
   * describing the exception.
   * @param message A message describing the exception.
   * @constructor
   */
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
