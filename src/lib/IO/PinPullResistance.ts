/**
 * Pin pull up/down resistance definition.
 * @enum
 */
export enum PinPullResistance {
  /**
   * Off. No resistance change.
   */
  OFF = 0,

  /**
   * Enable pull-down resistor.
   */
  PULL_DOWN = 1,

  /**
   * Enable pull-up resistor.
   */
  PULL_UP = 2,
}
