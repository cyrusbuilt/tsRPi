/**
 * @classdesc The exception that is thrown when an operation is attempted on an
 * object whose current state does not support it.
 * @extends [[Error]]
 */
export default class InvalidOperationException extends Error {
  /**
   * Initializes a new instance of the jsrpi.InvalidOperationException class
   * with a message describing the error.
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
