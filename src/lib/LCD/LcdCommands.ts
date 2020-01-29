/**
 * Flags for LCD commands.
 * @enum
 */
export enum LcdCommands {
  /**
   * Clears the display.
   */
  CLEAR_DISPLAY = 0x01,

  /**
   * Return cursor to home position.
   */
  RETURN_HOME = 0x02,

  /**
   * Set entry mode.
   */
  ENTRY_MODE_SET = 0x04,

  /**
   * Display control.
   */
  DISPLAY_CONTROL = 0x08,

  /**
   * Shift the cursor.
   */
  CURSOR_SHIFT = 0x10,

  /**
   * Set function.
   */
  FUNCTION_SET = 0x20,

  /**
   * Set CG RAM address.
   */
  SET_CG_RAM_ADDR = 0x40,

  /**
   * Set DD RAM address.
   */
  SET_DD_RAM_ADDR = 0x80,
}
