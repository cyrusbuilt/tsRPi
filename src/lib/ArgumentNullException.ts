/**
 * @classdesc The exception that is thrown when null is passed to a method or
 * constructor as a parameter when that method or constructor does not allow it.
 * @extends [[Error]]
 */
export default class ArgumentNullException extends Error {
  /**
   * Initializes a new instance of the jsrpi.ArgumentNullException class with a
   * description of the error.
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
