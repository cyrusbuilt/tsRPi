import { BoardRevision } from '../../../BoardRevision';
import InvalidOperationException from '../../../InvalidOperationException';
import I2CBus from '../../../IO/I2C/I2CBus';
import II2C from '../../../IO/I2C/II2C';
import IOException from '../../../IO/IOException';
import ObjectDisposedException from '../../../ObjectDisposedException';
import Coreutils from '../../../PiSystem/CoreUtils';
import SystemInfo from '../../../PiSystem/SystemInfo';
import ComponentBase from '../../ComponentBase';
import AxisGyroscope from '../AxisGyroscope';
import { GyroTriggerMode } from '../GyroTriggerMode';
import IGyro from '../IGyro';
import IMultiAxisGyroscope from '../IMultiAxisGyroscope';

const CALIBRATION_READS = 50;
const CALIBRATION_SKIPS = 5;

/**
 * @classdesc Represents a device abstraction component for an Analog Devices
 * ADXL345 High Resolution 3-axis Accelerometer.
 * @extends [[ComponentBase]]
 * @implements [[IMultiAxisGyroscope]]
 */
export default class ADXL345 extends ComponentBase implements IMultiAxisGyroscope {
  /**
   * The default physical bus address of the ADXL345.
   */
  public static readonly ADXL345_ADDRESS = 0x53;

  private device: II2C;
  private address: number;
  private xAxis: IGyro;
  private yAxis: IGyro;
  private zAxis: IGyro;
  private lastRead: number;
  private delta: number;
  private enabled: boolean;

  /**
   * Initializes a new instance of the [[ADXL345]]
   * class with the I2C device that represents the physical connection to the
   * gyro and the bus address of the device.
   * @param device The I2C device that represents the physical
   * connection to the gyro. If null, then it is assumbed that the host is a
   * revision 2 or higher board and a default [[I2CBus]] using the
   * rev 2 I2C bus path will be used instead.
   * @param busAddress The bus address of the device.
   */
  constructor(device?: II2C, busAddress: number = 0) {
    super();

    if (!device) {
      device = new I2CBus(BoardRevision.Rev2);
    }

    this.device = device;
    this.address = ADXL345.ADXL345_ADDRESS;
    if (busAddress > 0) {
      this.address = busAddress;
    }

    this.xAxis = new AxisGyroscope(this, 20);
    this.yAxis = new AxisGyroscope(this, 20);
    this.zAxis = new AxisGyroscope(this, 20);

    this.lastRead = 0;
    this.delta = 0;
    this.enabled = false;
  }

  /**
   * Gets the time difference (delta) since the last loop.
   * @readonly
   * @override
   */
  public get timeDelta() {
    return this.delta;
  }

  /**
   * Gets a reference to the X axis.
   * @readonly
   */
  public get x() {
    return this.xAxis;
  }

  /**
   * Gets a reference to the Y axis.
   * @readonly
   */
  public get y() {
    return this.yAxis;
  }

  /**
   * Gets a reference to the Z axis.
   * @readonly
   */
  public get z() {
    return this.zAxis;
  }

  /**
   * Gets whether or not the device is enabled.
   * @readonly
   */
  public get isEnabled() {
    return this.enabled;
  }

  /**
   * Releases all resources used by the ADXL345 object.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.device.dispose();
    // await this.xAxis.dispose();
    // await this.yAxis.dispose();
    // await this.zAxis.dispose();
    this.delta = 0;
    this.lastRead = 0;
    this.enabled = false;
    super.dispose();
  }

  /**
   * Enables the gyro.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the device.
   * @override
   */
  public async enable() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ADXL345');
    }

    if (this.enabled) {
      return;
    }

    const packet = Buffer.from([0x31, 0x0b]);
    await this.device.writeBytes(this.address, packet);
    this.enabled = true;
  }

  /**
   * Disables the gyro.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async disable() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ADXL345');
    }

    this.enabled = false;
  }

  /**
   * Initializes the gyro.
   * @param triggeringAxis The gyro that represents the single axis
   * responsible for the triggering of updates.
   * @param trigMode The gyro update trigger mode. Use one of the
   * [[GyroTriggerMode]] values.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the device.
   * @override
   */
  public async init(triggeringAxis: IGyro, trigMode: GyroTriggerMode = GyroTriggerMode.READ_NOT_TRIGGERED) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ADXL345');
    }

    if (!this.device.isOpen) {
      await this.device.open();
    }

    await this.enable();
    if (triggeringAxis === this.xAxis) {
      this.xAxis.setReadTrigger(trigMode);
    } else {
      this.xAxis.setReadTrigger(GyroTriggerMode.READ_NOT_TRIGGERED);
    }

    if (triggeringAxis === this.yAxis) {
      this.yAxis.setReadTrigger(trigMode);
    } else {
      this.yAxis.setReadTrigger(GyroTriggerMode.READ_NOT_TRIGGERED);
    }

    if (triggeringAxis === this.zAxis) {
      this.zAxis.setReadTrigger(trigMode);
    } else {
      this.zAxis.setReadTrigger(GyroTriggerMode.READ_NOT_TRIGGERED);
    }

    return triggeringAxis;
  }

  /**
   * Reads the gyro and stores the value internally.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if the ADXL345 is not enabled.
   * @throws [[IOException]] if unable to retrieve the gyro data.
   * @override
   */
  public async readGyro() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ADXL345');
    }

    if (!this.enabled) {
      throw new InvalidOperationException('Cannot read from a disabled device.');
    }

    const now = SystemInfo.getCurrentTimeMillis();
    this.delta = now - this.lastRead;
    this.lastRead = now;

    await this.device.writeByte(this.address, 0x08);
    await Coreutils.delay(10);
    const data = await this.device.readBytes(this.address, 6);
    if (data.length !== 6) {
      throw new IOException(`Couldn't read compass data; Returned buffer size: ${data.length}`);
    }

    this.xAxis.setRawValue(((data[0] & 0xff) << 8) + (data[1] & 0xff));
    this.yAxis.setRawValue(((data[2] & 0xff) << 8) + (data[3] & 0xff));
    this.zAxis.setRawValue(((data[3] & 0xff) << 8) + (data[5] & 0xff));
  }

  /**
   * Recalibrates the offset.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if the ADXL345 is not enabled.
   * @override
   */
  public async recalibrateOffset() {
    let totalX = 0;
    let totalY = 0;
    let totalZ = 0;

    let minX = 10000;
    let minY = 10000;
    let minZ = 10000;

    let maxX = -10000;
    let maxY = -10000;
    let maxZ = -10000;

    let x = 0;
    let y = 0;
    let z = 0;

    for (let i = 0; i < CALIBRATION_SKIPS; i++) {
      await this.readGyro();
      await Coreutils.sleepMicroseconds(1000);
    }

    for (let j = 0; j < CALIBRATION_READS; j++) {
      await this.readGyro();

      x = await this.xAxis.getRawValue();
      y = await this.yAxis.getRawValue();
      z = await this.zAxis.getRawValue();

      totalX += x;
      totalY += y;
      totalZ += z;

      if (x < minX) {
        minX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (z < minZ) {
        minZ = z;
      }

      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      if (z > maxZ) {
        maxZ = z;
      }
    }

    this.xAxis.offset = totalX / CALIBRATION_READS;
    this.yAxis.offset = totalY / CALIBRATION_READS;
    this.zAxis.offset = totalZ / CALIBRATION_READS;
  }
}
