/**
 * The state of a given pin.
 * @enum
 */
export enum PinState {
  /**
   * The pin is high (on) which means it is outputting > 3.3V (typically 5V).
   */
  HIGH = 1,

  /**
   * The pin is low, which means it is outputting 0v (or at least < 3.3V).
   */
  LOW = 0,
}
