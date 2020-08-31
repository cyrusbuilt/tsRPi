/**
 * Register memory addresses.
 */
export enum RegisterMemoryAddress {
  /**
   * Wiper 0.
   */
  WIPER0 = 0x00,

  /**
   * Wiper 1.
   */
  WIPER1 = 0x01,

  /**
   * Wiper 0 non-volatile.
   */
  WIPER0_NV = 0x02,

  /**
   * Wiper 1 non-volatile.
   */
  WIPER1_NV = 0x03,

  /**
   * Terminal control for wipers 0 and 1.
   */
  TCON01 = 0x04,

  /**
   * Wiper 2.
   */
  WIPER2 = 0x06,

  /**
   * Wiper 3.
   */
  WIPER3 = 0x07,

  /**
   * Wiper 2 non-volatile.
   */
  WIPER2_NV = 0x08,

  /**
   * Wiper 3 non-volatile.
   */
  WIPER3_NV = 0x09,

  /**
   * Terminal control for wipers 2 and 3.
   */
  TCON23 = 0x04,

  /**
   * No address.
   */
  NONE = 0,
}
