import IComponent from '../IComponent';
import { GyroTriggerMode } from './GyroTriggerMode';
import IGyro from './IGyro';

/**
 * A multi-axis gyroscope device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface IMultiAxisGyroscope extends IComponent {
  /**
   * Gets the time difference (delta) since the last loop.
   * @readonly
   */
  readonly timeDelta: number;

  /**
   * Initializes the gyro.
   * @param triggeringAxis The gyro that represents the single axis
   * responsible for the triggering of updates.
   * @param trigMode The gyro update trigger mode. Use one of the
   * [[GyroTriggerMode]] values.
   * @returns a reference to the specified triggering axis, which
   * may or may not have been modified.
   */
  init(triggeringAxis: IGyro, trigMode: GyroTriggerMode): Promise<IGyro | null>;

  /**
   * Enables the gyro.
   */
  enable(): Promise<void>;

  /**
   * Disables the gyro.
   */
  disable(): Promise<void>;

  /**
   * Reads the gyro and stores the value internally.
   */
  readGyro(): Promise<void>;

  /**
   * Recalibrates the offset.
   */
  recalibrateOffset(): Promise<void>;
}
