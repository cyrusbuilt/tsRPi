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
import { HMC5883LGains } from './HMC5883LGains';
import { HMC5883LOutputRate } from './HMC5883LOutputRate';
import { MeasurementMode } from './MeasurementMode';
import { OperationMode } from './OperationMode';
import { Samples } from './Samples';

const CALIBRATION_READS = 50;
const CALIBRATION_SKIPS = 5;

/**
 * @classdesc Represents a device abstraction component for a Honeywell HMC5883L
 * 3-axis Digital Compass IC. See http://www51.honeywell.com/aero/common/documents/myaerospacecatalog-documents/Defense_Brochures-documents/HMC5883L_3-Axis_Digital_Compass_IC.pdf
 * for details.
 * @extends [[ComponentBase]]
 * @implements [[IMultiAxisGyroscope]]
 */
export default class HMC5883L extends ComponentBase implements IMultiAxisGyroscope {
  /**
   * The default physical bus address of the HMC5883L.
   */
  public static readonly HMC5883L_ADDRESS: number = 0x1e;

  /**
   * Gets or sets the output rate (resolution).
   */
  public outputRate: HMC5883LOutputRate;

  /**
   * Gets or sets the average sample rate.
   */
  public samplesAverage: Samples;

  /**
   * Gets or sets the measurement mode.
   */
  public measurementMode: MeasurementMode;

  /**
   * Gets or sets the gain.
   */
  public gain: HMC5883LGains;

  /**
   * Gets or sets the mode of operation.
   */
  public mode: OperationMode;

  private device: II2C;
  private xAxis: IGyro;
  private yAxis: IGyro;
  private zAxis: IGyro;
  private address: number;
  private delta: number;
  private lastRead: number;
  private enabled: boolean;

  /**
   * Initializes a new instance of the [[HMC5883L]]
   * class with the I2C device that represents the physical connection to the
   * gyro.
   * @param device The I2C device that represents the physical
   * connection to the gyro. If null, then it is assumbed that the host is a
   * revision 2 or higher board and a default jsrpi.IO.I2C.I2CBus using the
   * rev 2 I2C bus path will be used instead.
   * @param busAddress The bus address of the device.
   * @constructor
   */
  constructor(device?: II2C, busAddress: number = 0) {
    super();

    if (!device) {
      device = new I2CBus(BoardRevision.Rev2);
    }

    this.device = device;
    this.xAxis = new AxisGyroscope(this, 20);
    this.yAxis = new AxisGyroscope(this, 20);
    this.zAxis = new AxisGyroscope(this, 20);
    this.address = HMC5883L.HMC5883L_ADDRESS;
    if (busAddress > 0) {
      this.address = busAddress;
    }

    this.delta = 0;
    this.lastRead = 0;
    this.enabled = false;
    this.outputRate = HMC5883LOutputRate.RATE_15_HZ;
    this.samplesAverage = Samples.AVERAGE_8;
    this.measurementMode = MeasurementMode.NORMAL_MODE;
    this.gain = HMC5883LGains.GAIN_1_3_GA;
    this.mode = OperationMode.CONTINUOUS;
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
   * Gets the time difference (delta) since the last loop.
   * @readonly
   * @override
   */
  public get timeDelta() {
    return this.delta;
  }

  /**
   * Gets a flag indicating whether or not the device is enabled.
   * @readonly
   */
  public get isEnabled() {
    return this.enabled;
  }

  /**
   * Releases all resources used by the HMC5883L5 object.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.device.dispose();

    // NOTE we can't dispose the X, Y, or Z axis objects because they
    // contain a circular reference back to this object that would
    // cause a crash. Those objects will each try to dispose the
    // reference to this object when we dispose them. So we just
    // have to let the GC clean them up by itself.

    this.address = 0;
    this.delta = 0;
    this.lastRead = 0;
    this.outputRate = HMC5883LOutputRate.RATE_15_HZ;
    this.samplesAverage = Samples.AVERAGE_8;
    this.measurementMode = MeasurementMode.NORMAL_MODE;
    this.gain = HMC5883LGains.GAIN_1_3_GA;
    this.mode = OperationMode.CONTINUOUS;
    super.dispose();
  }

  /**
   * Enables the gyro (if not already enabled).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to the device.
   * @override
   */
  public async enable() {
    if (this.isEnabled) {
      return;
    }

    if (this.isDisposed) {
      throw new ObjectDisposedException('HMC5883L');
    }

    const packet = Buffer.from([2, 0]);
    await this.device.writeBytes(this.address, packet);
    this.enabled = true;
  }

  /**
   * Disables the gyro (if not already disabled).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to the device.
   * @override
   */
  public async disable() {
    if (!this.isEnabled) {
      return;
    }

    if (this.isDisposed) {
      throw new ObjectDisposedException('HMC5883L');
    }

    const initPkt = Buffer.from([
      (this.samplesAverage << 5) + (this.outputRate << 2) + this.measurementMode,
      this.gain << 5,
      OperationMode.IDLE,
    ]);

    await this.device.writeBytes(this.address, initPkt);
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
      throw new ObjectDisposedException('HMC5883L');
    }

    if (!this.device.isOpen) {
      await this.device.open();
    }

    await this.enable();
    this.x.setReadTrigger(triggeringAxis === this.x ? trigMode : GyroTriggerMode.READ_NOT_TRIGGERED);
    this.y.setReadTrigger(triggeringAxis === this.y ? trigMode : GyroTriggerMode.READ_NOT_TRIGGERED);
    this.z.setReadTrigger(triggeringAxis === this.z ? trigMode : GyroTriggerMode.READ_NOT_TRIGGERED);
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
      throw new ObjectDisposedException('HMC5883L');
    }

    if (!this.isEnabled) {
      throw new InvalidOperationException('Cannot read gyro. Device is disabled.');
    }

    const now = SystemInfo.getCurrentTimeMillis();
    this.delta = now - this.lastRead;
    this.lastRead = now;

    const data = await this.device.readBytes(this.address, 6);
    if (data.length !== 6) {
      throw new IOException(`Couldn't read compass data; Returned buffer size ${data.length}`);
    }

    await this.x.setRawValue(((data[0] & 0xff) << 8) + (data[1] & 0xff));
    await this.y.setRawValue(((data[2] & 0xff) << 8) + (data[3] & 0xff));
    await this.z.setRawValue(((data[3] & 0xff) << 8) + (data[5] & 0xff));
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

    let x = 0;
    let y = 0;
    let z = 0;

    let minX = 10000;
    let minY = 10000;
    let minZ = 10000;

    let maxX = -10000;
    let maxY = -10000;
    let maxZ = -10000;

    for (let i = 0; i < CALIBRATION_SKIPS; i++) {
      await this.readGyro();
      await Coreutils.sleepMicroseconds(1000);
    }

    for (let j = 0; j < CALIBRATION_READS; j++) {
      await this.readGyro();

      x = await this.x.getRawValue();
      y = await this.y.getRawValue();
      z = await this.z.getRawValue();

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

    this.x.offset = totalX / CALIBRATION_READS;
    this.y.offset = totalY / CALIBRATION_READS;
    this.z.offset = totalZ / CALIBRATION_READS;
  }
}
