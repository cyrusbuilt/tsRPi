import IDisposable from '../../../IDisposable';
import II2C from '../../../IO/I2C/II2C';
import { MCPCommand } from './MCPCommand';
import IOException from '../../../IO/IOException';
import { StatusBit } from './StatusBit';
import DeviceControllerDeviceStatus from './DeviceControllerDeviceStatus';
import ObjectDisposedException from '../../../ObjectDisposedException';
import DeviceControlChannel from './DeviceControlChannel';
import DeviceControllerTerminalConfiguration from './DeviceControllerTerminalConfiguration';
import IllegalArgumentException from '../../../IllegalArgumentException';

const MEMADDR_STATUS = 0x05;
const MEMADDR_WRITEPROTECTION = 0x0f;

/**
 * @classdesc An MCP45XX and MCP46XX device controller component. This mostly a port of the
 * <a href="https://github.com/Pi4J/pi4j/blob/master/pi4j-device/src/main/java/com/pi4j/component/potentiometer/microchip">
 * device controller in the Pi4J project
 * </a> (Java port author <a href="http://raspelikan.blogspot.co.at">Raspelikan</a>)
 * which is a port of similar C++ code from <a href="http://blog.stibrany.com/?p=9">Stibro's code blog</a>.
 * @implements [[IDisposable]]
 */
export default class MicrochipPotDeviceController implements IDisposable {
  /**
   * Flag to use when indicating a volatile wiper.
   * @readonly
   */
  public static readonly VOLATILE_WIPER = true;

  /**
   * Flag to use when indicating a non-volatile wiper.
   * @readonly
   */
  public static readonly NONVOLATILE_WIPER = false;

  private mBusAddress: number;
  private mIsDisposed: boolean;
  private mDevice: II2C;

  /**
   * Initializes a new instance of the jsrpi.Components.Potentiometers.Microchip.MicrochipPotDeviceController
   * class with the I2C bus device this instance is connected to and the bus
   * address of that device.
   * @param device The I2C bus device this instance is connected to.
   * @param busAddress The bus address of the device.
   * @constructor
   */
  constructor(device: II2C, busAddress: number = -1) {
    this.mBusAddress = busAddress;
    this.mIsDisposed = false;
    this.mDevice = device;
  }

  /**
   * Determines whether or not the current instance has been disposed.
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.mIsDisposed;
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    if (!this.mDevice.isDisposed) {
      await this.mDevice.dispose();
    }

    this.mIsDisposed = true;
  }

  /**
   * Initialize bus access to the device.
   */
  public async begin() {
    if (!this.mDevice.isOpen) {
      await this.mDevice.open();
    }
  }

  /**
   * Gets the device status.
   * @returns The device status.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if status bits 4 to 8 are not set to 1 or if a
   * malformed response was returned from the device.
   */
  public async getDeviceStatus() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    // Get status from device.
    const stat = await this.read(MEMADDR_STATUS);

    // Check formal criterias.
    const reservedVal = stat & StatusBit.RESERVED_MASK;
    if (reservedVal !== StatusBit.RESERVED_VALUE) {
      throw new IOException(
        `Status bits 4 to 8 must be 1 according to documentation chapter 4.2.2.1. Got: ${reservedVal}`,
      );
    }

    // Build result.
    const eepromWriteActive = (stat & StatusBit.EEPROM_WRITEACTIVE) > 0;
    const eepromWriteProt = (stat & StatusBit.EEPROM_WRITEPROTECTION) > 0;
    const wiperLock0 = (stat & StatusBit.WIPER_LOCK0) > 0;
    const wiperLock1 = (stat & StatusBit.WIPER_LOCK1) > 0;
    return new DeviceControllerDeviceStatus(eepromWriteActive, eepromWriteProt, wiperLock0, wiperLock1);
  }

  /**
   * Enables or disables the device's write-protection.
   * @param enabled Set true to enable write protection, or false to disable.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async setWriteProtection(enabled: boolean = false) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    await this.increaseOrDecrease(MEMADDR_WRITEPROTECTION, enabled, 1);
  }

  /**
   * Enables or disables the wiper's lock.
   * @param channel The channel of the wiper to set the lock for.
   * @param locked Set true to enable the lock, or false to disable.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async setWiperLock(channel: DeviceControlChannel, locked: boolean = false) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    const memAddr = channel.nonVolatileMemoryAddress;
    await this.increaseOrDecrease(memAddr, locked, 1);
  }

  /**
   * Sets the device's terminal configuration.
   * @param config The configuration to set.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async setTerminalConfiguration(config: DeviceControllerTerminalConfiguration) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    // Read current config.
    const chan = config.channel;
    const memAddr = chan.terminalControlAddress;
    let tcon = await this.read(memAddr);

    // Modify configuration
    tcon = this.setBit(tcon, chan.hardwareConfigControlBit, config.channelEnabled);
    tcon = this.setBit(tcon, chan.terminalAConnectionControlBit, config.pinAEnabled);
    tcon = this.setBit(tcon, chan.wiperConnectionControlBit, config.pinWEnabled);
    tcon = this.setBit(tcon, chan.terminalBConnectionControlBit, config.pinBEnabled);

    // Write new config to device.
    await this.write(memAddr, tcon);
  }

  /**
   * Gets the terminal configuration for the specified channel.
   * @param channel The channel to get the terminal configuration for.
   * @returns The terminal configuration.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async getTerminalConfiguration(channel: DeviceControlChannel) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    // Read the current config.
    const tcon = await this.read(channel.terminalControlAddress);

    // Build result
    const chanEnabled = (tcon & channel.hardwareConfigControlBit) > 0;
    const pinAEnabled = (tcon & channel.terminalAConnectionControlBit) > 0;
    const pinWEnabled = (tcon & channel.wiperConnectionControlBit) > 0;
    const pinBEnabled = (tcon & channel.terminalBConnectionControlBit) > 0;
    return new DeviceControllerTerminalConfiguration(channel, chanEnabled, pinAEnabled, pinBEnabled, pinWEnabled);
  }

  /**
   * Sets the wiper's value in the device.
   * @param channel The device channel the wiper is on.
   * @param value The wiper's value.
   * @param nonVolatile Set true to write to non-volatile memory,
   * or false to write to volatile memory.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   * @throws [[IllegalArgumentException]] if value param is a negative value.
   */
  public async setValue(channel: DeviceControlChannel, value: number = 0, nonVolatile: boolean = false) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    if (value < 0) {
      throw new IllegalArgumentException(
        "Only positive integer values are permitted. Got value: '" +
          value.toString() +
          "' for writing to channel '" +
          channel.name +
          "'.",
      );
    }

    // Choose proper mem address.
    const memAddr = nonVolatile ? channel.nonVolatileMemoryAddress : channel.volatileMemoryAddress;

    // Write value to device.
    await this.write(memAddr, value);
  }

  /**
   * Receives the current wiper's value from the device.
   * @param channel The device channel the wiper is on.
   * @param nonVolatile Set true to read from non-volatile memory,
   * false to read from volatile memory.
   * @returns The wiper's value.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async getValue(channel: DeviceControlChannel, nonVolatile: boolean = false) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    // Select proper memory address, then read the value at that address.
    const memAddr = nonVolatile ? channel.nonVolatileMemoryAddress : channel.volatileMemoryAddress;
    const result = await this.read(memAddr);
    return result;
  }

  /**
   * Decrements the volatile wiper for the given number of steps.
   * @param channel The device channel the wiper is on.
   * @param steps The number of steps.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async decrease(channel: DeviceControlChannel, steps: number = 0) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    const memAddr = channel.volatileMemoryAddress;
    await this.increaseOrDecrease(memAddr, false, steps);
  }

  /**
   * Increments the volatile wiper for the given number of steps.
   * @param channel The device channel the wiper is on.
   * @param steps The number of steps.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an I/O error occurred. The specified address is
   * inaccessible or the I2C transaction failed.
   */
  public async increase(channel: DeviceControlChannel, steps: number = 0) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotDeviceController');
    }

    // Decrease only works on volatile-wiper.
    const memAddr = channel.volatileMemoryAddress;
    await this.increaseOrDecrease(memAddr, true, steps);
  }

  private async read(memAddr: number) {
    // Command to ask device for reading data.
    const cmd = (memAddr << 4) | MCPCommand.READ;
    await this.mDevice.writeByte(this.mBusAddress, cmd);

    // Read 2 bytes.
    const buf = await this.mDevice.readBytes(this.mBusAddress, 2);
    if (buf.length !== 2) {
      throw new IOException(`Malformed response. Expected to read two bytes but got: ${buf.length.toString}`);
    }

    // Transform signed byte to unsigned byte stored as int.
    const first = buf[0] & 0xff;
    const second = buf[1] & 0xff;

    // Interpret both bytes as one integer.
    return (first << 8) | second;
  }

  private async write(memAddr: number, val: number) {
    // Bit 8 of value.
    const firstBit = (val >> 0) & 0x000001;

    // Command to ask device for setting value.
    const cmd = (memAddr << 4) | MCPCommand.WRITE | firstBit;

    // Now the 7 bits of actual value.
    const data = val & 0x00ff;

    // Write the sequence of command and data.
    const pkt = Buffer.of(cmd, data);
    await this.mDevice.writeBytes(this.mBusAddress, pkt);
  }

  private async increaseOrDecrease(memAddr: number, increase: boolean = false, steps: number = 0) {
    // 0 steps means 'do nothing'
    if (steps === 0) {
      return;
    }

    // Negative steps means decrease on 'increase' or increase on 'decrease'.
    let actualSteps = steps;
    let actualIncrease = increase;
    if (steps < 0) {
      actualIncrease = !increase;
      actualSteps = Math.abs(steps);
    }

    // Ask device for increase or decrease.
    const cmd = (memAddr << 4) | (actualIncrease ? MCPCommand.INCREASE : MCPCommand.DECREASE);

    // Build sequence of commands (one for each step).
    const sequence = Array<number>(actualSteps);
    for (let i = 0; i < sequence.length; i++) {
      sequence[i] = cmd;
    }

    // Write sequence to the device.
    await this.mDevice.writeBytes(this.mBusAddress, Buffer.from(sequence));
  }

  private setBit(mem: number, mask: number, val: boolean = false) {
    return val ? mem | mask : mem & ~mask;
  }
}
