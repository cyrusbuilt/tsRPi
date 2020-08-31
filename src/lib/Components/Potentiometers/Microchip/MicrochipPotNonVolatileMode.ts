/**
 * Read/Write volatility modes.
 */
export enum MicrochipPotNonVolatileMode {
  /**
   * Read and write to volatile-wiper.
   */
  VOLATILE_ONLY = 0,

  /**
   * Read and write to non-volatile-wiper.
   */
  NON_VOLATILE_ONLY = 1,

  /**
   * Read and write to both volatile- and non-volatile-wipers.
   */
  VOLATILE_AND_NON_VOLATILE = 3,
}
