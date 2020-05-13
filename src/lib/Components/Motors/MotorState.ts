/**
 * The state of the motor.
 */
export enum MotorState {
  /**
   * The motor is stopped.
   */
  STOPPED = 0,

  /**
   * The motor is moving in the forward direction.
   */
  FORWARD = 1,

  /**
   * The motor is moving in the reverse direction.
   */
  REVERSE = -1,
}
