/**
 * Display on/off controls.
 * @enum
 */
export enum DisplayOnOffControl {
  /**
   * Turn the display on.
   */
  DISPLAY_ON = 0x04,

  /**
   * Turn the display off.
   */
  DISPLAY_OFF = 0x00,

  /**
   * Turn the cursor on.
   */
  CURSOR_ON = 0x02,

  /**
   * Turn the cursor off.
   */
  CURSOR_OFF = 0x00,

  /**
   * Turn the cursor blink on.
   */
  BLINK_ON = 0x01,

  /**
   * Turn the cursor blink off.
   */
  BLINK_OFF = 0x00,
}
