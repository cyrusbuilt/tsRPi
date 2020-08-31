/**
 * Device status bits.
 */
export enum StatusBit {
  /**
   * Reserved mask.
   */
  RESERVED_MASK = 0x0000111110000,

  /**
   * Reserved value.
   */
  RESERVED_VALUE = 0x0000111110000,

  /**
   * EEPROM write is active.
   */
  EEPROM_WRITEACTIVE = 0x1000,

  /**
   * Wiper lock 1 enabled.
   */
  WIPER_LOCK1 = 0x0100,

  /**
   * Wiper lock 0 enabled.
   */
  WIPER_LOCK0 = 0x0010,

  /**
   * EEPROM write-protected.
   */
  EEPROM_WRITEPROTECTION = 0x0001,

  /**
   * Null bit.
   */
  NONE = 0,
}
