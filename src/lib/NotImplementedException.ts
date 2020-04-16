/**
 * @classdesc The exception that is thrown when a method has been called that
 * has not yet been implemented.
 * @extends [[Error]]
 */
export default class NotImplementedException extends Error {
  /**
   * Initializes a new instance of the jsrpi.NotImplementedException class with
   * a message describing the exception.
   * @param message A message describing the exception (optional).
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
