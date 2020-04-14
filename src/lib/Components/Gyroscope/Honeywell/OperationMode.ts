/**
 * Possible operation modes for the Honeywell gyro.
 */
export enum OperationMode {
  /**
   * Continuous sample mode. Continuously takes measurements.
   */
  CONTINUOUS = 0,

  /**
   * Single sample mode. Default power-up mode. In this mode,
   * the gyro will take a single sample and then switch to
   * idle mode.
   */
  SINGLE_SAMPLE = 1,

  /**
   * Idle mode (no sampling).
   */
  IDLE = 2,
}
