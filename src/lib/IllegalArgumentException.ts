/**
 * @classdesc The exception that is thrown if an argument value passed to a
 * function is illegal or invalid.
 * @extends [[Error]]
 */
export default class IllegalArgumentException extends Error {
  /**
   * Initializes a new instance of the jsrpi.IllegalArgumentException class with
   * a message describing the error.
   * @param message A description of the error.
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
