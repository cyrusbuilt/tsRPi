import MicrochipPotentiometerBase from './MicrochipPotentiometerBase';
import { MicrochipPotChannel } from './MicrochipPotChannel';
import II2C from '../../../IO/I2C/II2C';
import { MicrochipPotNonVolatileMode } from './MicrochipPotNonVolatileMode';

const SUPPORTED_CHANNELS = [MicrochipPotChannel.A, MicrochipPotChannel.B];

/**
 * @classdesc Hardware device abstraction component for the Microchip MCP4631.
 * @extends [[MicrochipPotentiometerBase]]
 */
export default class MCP4631 extends MicrochipPotentiometerBase {
  /**
   * Initializes a new instance of the MCP4631 class wit the I2C device that
   * is the connection to the MCP631, whether the address pin A0 is high or
   * not, and the initial value of the wiper.
   * @param device The I2C bus device this instance is connected to.
   * @param pinA0 Whether the device's address pin A0 is high (true) or low (false).
   * @param pinA1 Whether the device's address pin A1 is high (true) or low (false).
   * @param pinA2 Whether the device's address pin A2 is high (true) or low (false).
   * @param channel Which of the potentiometers provided by the device to control.
   * @param initialValue The value for devices which are not capable of non-volatile wipers.
   * @constructor
   */
  constructor(
    device: II2C,
    pinA0: boolean = false,
    pinA1: boolean = false,
    pinA2: boolean = false,
    channel: MicrochipPotChannel = MicrochipPotChannel.NONE,
    initialValue: number = 0,
  ) {
    super(device, pinA0, pinA1, pinA2, channel, MicrochipPotNonVolatileMode.VOLATILE_ONLY, initialValue);
  }

  /**
   * Gets whether or not the device is capable of non-volatile wipers.
   * @readonly
   * @override
   */
  public get isNonVolatileWiperCapable() {
    return false;
  }

  /**
   * Gets the maximum wiper-value supported by the device.
   * @readonly
   * @override
   */
  public get maxValue() {
    return 128;
  }

  /**
   * Gets whether the device is a potentiometer or a rheostat.
   * @readonly
   * @override
   */
  public get isRheostat() {
    return false;
  }

  /**
   * Gets the channels that are supported by the underlying device.
   * @readonly
   * @override
   */
  public get supportedChannels() {
    return SUPPORTED_CHANNELS;
  }
}
