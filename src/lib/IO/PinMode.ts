/**
 * The mode of the GPIO pin.
 * @enum
 */
export enum PinMode {
  /**
   * Pin is an input.
   */
  IN = 0,

  /**
   * Pin is an output.
   */
  OUT = 1,

  /**
   * Pin is a PWM (Pulse-Width Modulation) output.
   */
  PWM = 2,

  /**
   * Pin is in clock mode.
   */
  CLOCK = 3,

  /**
   * Set internal pull-up resistor.
   */
  UP = 2,

  /**
   * Set internal pull-down resistor.
   */
  DOWN = 1,

  /**
   * Sets mode to none.
   */
  TRI = 0,
}
