import IPin from './IPin';

/**
 * @classdesc The exception that is thrown when an invalid pin mode is used.
 * @extends [[Error]]
 */
export default class InvalidPinModeException extends Error {
  /**
   * Gets the pin that is the cause of the exception.
   * @readonly
   * @property
   */
  public readonly pin: IPin;

  /**
   * Initializes a new instance of the jsrpi.IO.InvalidPinModeException class
   * with the pin that has the incorrect mode and a message describing the
   * exception.
   * @param message The message describing the exception.
   * @param pin The pin that is the cause of the exception.
   * @constructor
   */
  constructor(message: string, pin: IPin) {
    super(message);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }

    this.pin = pin;
  }
}
