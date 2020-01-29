/**
 * Function set flags.
 * @enum
 */
export enum FunctionSetFlags {
  /**
   * Set 4-bit mode.
   */
  FOUR_BIT_MODE = 0x00,

  /**
   * Set 8-bit mode.
   */
  EIGHT_BIT_MODE = 0x10,

  /**
   * Set one line display.
   */
  ONE_LINE = 0x00,

  /**
   * Set two line display.
   */
  TWO_LINE = 0x08,

  /**
   * Set 5x8 dots.
   */
  FIVE_BY_EIGHT_DOTS = 0x00,

  /**
   * Set 5x1 dots.
   */
  FIVE_BY_ONE_DOTS = 0x04,
}
