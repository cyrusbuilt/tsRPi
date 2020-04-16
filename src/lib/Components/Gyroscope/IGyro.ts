import IComponent from '../IComponent';
import { GyroTriggerMode } from './GyroTriggerMode';

/**
 * A single-axis gyroscope device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface IGyro extends IComponent {
  /**
   * Gets or sets the offset value, which is the value the gyro outputs when
   * not rotating.
   */
  offset: number;

  /**
   * Gets the raw value.
   * @return The raw value.
   */
  getRawValue(): Promise<number>;

  /**
   * Sets the raw value.
   * @param value The raw value.
   */
  setRawValue(value: number): void;

  /**
   * Gets the gyro angle (angular position).
   */
  getAngle(): Promise<number>;

  /**
   * Sets the gyro angle (angular position).
   * @param angle The gyro angle.
   */
  setAngle(angle: number): void;

  /**
   * Gets the angular velocity.\
   * @return The angular velocity.
   */
  getAngularVelocity(): Promise<number>;

  /**
   * Recalibrates the offset.
   */
  recalibrateOffset(): Promise<void>;

  /**
   * Sets the read trigger.
   * @param trig The trigger mode to re-read the gyro value. Use
   * one of the [[GyroTriggerMode]] values.
   */
  setReadTrigger(trig: GyroTriggerMode): void;
}
