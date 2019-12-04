/**
 * The PWM channel to use.
 * @enum
 */
export enum PwmChannel {
  /**
   * Channel zero.
   */
  CHANNEL0 = 0,

  /**
   * Channel one.
   */
  CHANNEL1 = 1,
}

/**
 * PWM clock divider values.
 * @enum
 */
export enum PwmClockDivider {
  /**
   * Divide clock by a factor of 1.
   */
  Divisor1 = 1,

  /**
   * Divide clock by a factor of 2.
   */
  Divisor2 = 2,

  /**
   * Divide clock by a factor of 4.
   */
  Divisor4 = 4,

  /**
   * Divide clock by a factor of 8.
   */
  Divisor8 = 8,

  /**
   * Divide clock by a factor of 16.
   */
  Divisor16 = 16,

  /**
   * Divide clock by a factor of 32.
   */
  Divisor32 = 32,

  /**
   * Divide clock by a factor of 64.
   */
  Divisor64 = 64,

  /**
   * Divide clock by a factor of 128.
   */
  Divisor128 = 128,

  /**
   * Divide clock by a factor of 256.
   */
  Divisor256 = 256,

  /**
   * Divide clock by a factor of 512.
   */
  Divisor512 = 512,

  /**
   * Divide clock by a factor of 1024.
   */
  Divisor1024 = 1024,

  /**
   * Divide clock by a factor of 2048.
   */
  Divisor2048 = 2048,
}

/**
 * Which PWM mode to use.
 * @enum
 */
export enum PwmMode {
  /**
   * Balanced mode.
   */
  BALANCED = 0,

  /**
   * Mark-Space mode.
   */
  MARKSPACE = 1,
}
