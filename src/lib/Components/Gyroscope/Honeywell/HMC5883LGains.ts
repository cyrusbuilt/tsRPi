/**
 * Possible Gyro gains. Gyro gain is essentially how
 * aggressively the gyro attempts to correct drift.
 */
export enum HMC5883LGains {
  /**
   * 0.88% gain.
   */
  GAIN_0_88_GA = 0,

  /**
   * 1.3% gain.
   */
  GAIN_1_3_GA = 1,

  /**
   * 1.9% gain.
   */
  GAIN_1_9_GA = 2,

  /**
   * 2.5% gain.
   */
  GAIN_2_5_GA = 3,

  /**
   * 4.0% gain.
   */
  GAIN_4_0_GA = 4,

  /**
   * 4.7% gain.
   */
  GAIN_4_7_GA = 5,

  /**
   * 5.6% gain.
   */
  GAIN_5_6_GA = 6,

  /**
   * 8.1% gain.
   */
  GAIN_8_1_GA = 7,
}
