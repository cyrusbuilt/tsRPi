/**
 * @classdesc The exception that is thrown when an object is referenced that has
 * been disposed.
 * @extends [[Error]]
 */
export default class ObjectDisposedException extends Error {
  /**
   * Initializes a new instance of jsrpi.ObjectDisposedException with the object
   * that has been disposed.
   * @param object The name of the object that has been disposed.
   * @constructor
   */
  constructor(object: string) {
    const message = `${object} has been disposed and can no longer be referenced.`;
    super(message);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
