/**
 * Possible triggers for reading data from a gyroscope.
 */
export enum GyroTriggerMode {
  /**
   * The read will not be triggered.
   */
  READ_NOT_TRIGGERED = 0,

  /**
   * Triggers the device read when requesting the angle.
   */
  GET_ANGLE_TRIGGER_READ = 1,

  /**
   * Triggers the device read when requesting the angular velocity.
   */
  GET_ANGULAR_VELOCITY_TRIGGER_READ = 2,

  /**
   * Triggers the device read when requesting the raw value.
   */
  GET_RAW_VALUE_TRIGGER_READ = 4,
}
