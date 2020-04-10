import { thisTypeAnnotation } from '@babel/types';
import ObjectDisposedException from '../../ObjectDisposedException';
import ComponentBase from '../ComponentBase';
import { GyroTriggerMode } from './GyroTriggerMode';
import IGyro from './IGyro';
import IMultiAxisGyroscope from './IMultiAxisGyroscope';

/**
 * A generic gyroscope device abstraction component.
 * @extends [[ComponentBase]]
 * @implements [[IGyro]]
 */
export default class AxisGyroscope extends ComponentBase implements IGyro {
  /**
   * Gets or sets the offset value, which is the value the gyro outputs when
   * not rotating.
   * @override
   */
  public offset: number;

  private gyro: IMultiAxisGyroscope;
  private trig: GyroTriggerMode;
  private val: number;
  private angle: number;
  private degPerSecondFactor: number;
  private factorSet: boolean;

  /**
   * Initializes a new instance of the [[AxisGyroscope]]
   * class with the multi-axis gyro to read from.
   * @param multiAxisGyro The multi-axis gyro to read from.
   * @param degPerSecondFactor The degrees-per-second factor value. Default
   * is 0.
   * @constructor
   */
  constructor(multiAxisGyro: IMultiAxisGyroscope, degPerSecondFactor: number = 0) {
    super();
    this.gyro = multiAxisGyro;
    this.trig = GyroTriggerMode.READ_NOT_TRIGGERED;
    this.val = 0;
    this.offset = 0;
    this.angle = 0;
    this.degPerSecondFactor = 0;
    this.factorSet = false;
    if (degPerSecondFactor > 0) {
      this.degPerSecondFactor = degPerSecondFactor;
      this.factorSet = true;
    }
  }

  /**
   * Returns the string representation of this object. In this case, it simply
   * returns the component name.
   * @returns The component name, gyro component name, or an empty string.
   * @override
   */
  public toString() {
    return this.componentName || this.gyro.componentName || '';
  }

  /**
   * Releases all resources used by the AxisGyroscope object.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.gyro.dispose();
    this.trig = GyroTriggerMode.READ_NOT_TRIGGERED;
    this.val = 0;
    this.offset = 0;
    this.angle = 0;
    this.degPerSecondFactor = 0;
    this.factorSet = false;
    super.dispose();
  }

  /**
   * Reads and updates the angle.
   * @returns The angular velocity of the gyro.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the gyro.
   */
  public async readAndUpdateAngle() {
    await this.gyro.readGyro();
    let angularVelocity = ((this.val - this.offset) / 40) * 40;
    if (this.factorSet) {
      angularVelocity /= this.degPerSecondFactor;
    }

    this.angle = this.angle + (angularVelocity * this.gyro.timeDelta) / 1000;
    return angularVelocity;
  }

  /**
   * Gets the raw value.
   * @returns The raw value.
   * @throw [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the gyro.
   * @override
   */
  public async getRawValue() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }

    if (this.trig === GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ) {
      await this.readAndUpdateAngle();
    }

    return this.val;
  }

  /**
   * Sets the raw value.
   * @param value The raw value.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public setRawValue(value: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }
    this.val = value;
  }

  /**
   * Gets the gyro angle (angular position).
   * @returns The gyro angle
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the gyro.
   * @override
   */
  public async getAngle() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }

    if (this.trig === GyroTriggerMode.GET_ANGLE_TRIGGER_READ) {
      await this.readAndUpdateAngle();
    }

    return this.angle;
  }

  /**
   * Sets the gyro angle.
   * @param angle The angle (in degrees).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public setAngle(angle: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }
    this.angle = angle;
  }

  /**
   * Gets the angular velocity.
   * @returns The angular velocity.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the gyro.
   * @override
   */
  public async getAngularVelocity() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }

    if (this.trig === GyroTriggerMode.GET_ANGULAR_VELOCITY_TRIGGER_READ) {
      return await this.readAndUpdateAngle();
    }

    const adjusted = this.angle - this.offset;
    if (this.factorSet) {
      return adjusted / this.degPerSecondFactor;
    }

    return adjusted;
  }

  /**
   * Sets the read trigger.
   * @param trig The trigger mode to re-read the gyro value. Use
   * one of the [[GyroTriggerMode]] values.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public setReadTrigger(trig: GyroTriggerMode) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('AxisGyroscope');
    }
    this.trig = trig;
  }

  /**
   * Recalibrates the offset.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the gyro.
   * @override
   */
  public async recalibrateOffset() {
    await this.gyro.recalibrateOffset();
  }
}
