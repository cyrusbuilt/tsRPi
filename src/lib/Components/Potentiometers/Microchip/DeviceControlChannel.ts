import { RegisterMemoryAddress } from './RegisterMemoryAddress';
import { TerminalControlRegisterBit } from './TerminalControlRegisterBit';
import { MicrochipPotChannel } from './MicrochipPotChannel';
import StringUtils from '../../../StringUtils';

/**
 * @classdesc This class represents the wiper. It is used for devices knowing
 * more than one wiper.
 */
export default class DeviceControlChannel {
  /**
   * Gets device control channel A.
   * @readonly
   */
  public static get A() {
    return new DeviceControlChannel(
      RegisterMemoryAddress.WIPER0,
      RegisterMemoryAddress.WIPER0_NV,
      RegisterMemoryAddress.TCON01,
      TerminalControlRegisterBit.TCON_RH02HW,
      TerminalControlRegisterBit.TCON_RH02A,
      TerminalControlRegisterBit.TCON_RH02B,
      TerminalControlRegisterBit.TCON_RH02W,
      MicrochipPotChannel.A,
    );
  }

  /**
   * Gets device control channel B.
   * @readonly
   */
  public static get B() {
    return new DeviceControlChannel(
      RegisterMemoryAddress.WIPER1,
      RegisterMemoryAddress.WIPER1_NV,
      RegisterMemoryAddress.TCON01,
      TerminalControlRegisterBit.TCON_RH13HW,
      TerminalControlRegisterBit.TCON_RH13A,
      TerminalControlRegisterBit.TCON_RH13B,
      TerminalControlRegisterBit.TCON_RH13W,
      MicrochipPotChannel.B,
    );
  }

  /**
   * Gets device control channel C.
   * @readonly
   */
  public static get C() {
    return new DeviceControlChannel(
      RegisterMemoryAddress.WIPER2,
      RegisterMemoryAddress.WIPER2_NV,
      RegisterMemoryAddress.TCON23,
      TerminalControlRegisterBit.TCON_RH02HW,
      TerminalControlRegisterBit.TCON_RH02A,
      TerminalControlRegisterBit.TCON_RH02B,
      TerminalControlRegisterBit.TCON_RH02W,
      MicrochipPotChannel.C,
    );
  }

  /**
   * Gets device control channel D.
   * @readonly
   */
  public static get D() {
    return new DeviceControlChannel(
      RegisterMemoryAddress.WIPER3,
      RegisterMemoryAddress.WIPER3_NV,
      RegisterMemoryAddress.TCON23,
      TerminalControlRegisterBit.TCON_RH13HW,
      TerminalControlRegisterBit.TCON_RH13A,
      TerminalControlRegisterBit.TCON_RH13B,
      TerminalControlRegisterBit.TCON_RH13HW,
      MicrochipPotChannel.D,
    );
  }

  /**
   * Gets all device control channels.
   * @readonly
   */
  public static get ALL() {
    return [DeviceControlChannel.A, DeviceControlChannel.B, DeviceControlChannel.C, DeviceControlChannel.D];
  }

  /**
   * Factory method for creating a device control channel based on the
   * given potentiometer channel.
   * @param channel The MCP potentiometer channel.
   * @returns A new instance of [[DeviceControlChannel]].
   * If no potentiometer channel was specified or is invalid, then returns null.
   */
  public static valueOf(channel: MicrochipPotChannel) {
    if (channel === MicrochipPotChannel.NONE) {
      return null;
    }

    let result = null;
    const chanName = MicrochipPotChannel[channel];
    for (const dc of DeviceControlChannel.ALL) {
      if (dc.name === chanName) {
        result = dc;
        break;
      }
    }

    return result;
  }

  private mVolatileMemAddr: RegisterMemoryAddress;
  private mNonVolatileMemAddr: RegisterMemoryAddress;
  private mTermConAddr: RegisterMemoryAddress;
  private mHwConfigCtrlBit: TerminalControlRegisterBit;
  private mTermAConnCtrlBit: TerminalControlRegisterBit;
  private mTermBConnCtrlBit: TerminalControlRegisterBit;
  private mWiperConnCtrlBit: TerminalControlRegisterBit;
  private mChan: MicrochipPotChannel;

  /**
   * Initializes a new instance of the [[DeviceControlChannel]]
   * class with the volatile memory address, non-volatile memory address,
   * terminal control address, hardware-config control bit, terminal A
   * connection control bit, terminal B connection control bit, wiper
   * connection control bit, and MCP potentiometer channel.
   * @param volatileMemAddr The volatile memory address.
   * @param nonVolatileMemAddr The non-volatile memory address.
   * @param termConnAddr The terminal control address.
   * @param hwConfigAddr The hardware config control bit.
   * @param termAConnCtrlBit The terminal A connection control bit.
   * @param termBConnCtrlBit The terminal B connection control bit.
   * @param wiperConnCtrlBit The wiper connection control bit.
   * @param channel The MCP potentiometer channel.
   * @constructor
   */
  constructor(
    volatileMemAddr: RegisterMemoryAddress = RegisterMemoryAddress.NONE,
    nonVolatileMemAddr: RegisterMemoryAddress = RegisterMemoryAddress.NONE,
    termConnAddr: RegisterMemoryAddress = RegisterMemoryAddress.NONE,
    hwConfigAddr: TerminalControlRegisterBit = TerminalControlRegisterBit.NONE,
    termAConnCtrlBit: TerminalControlRegisterBit = TerminalControlRegisterBit.NONE,
    termBConnCtrlBit: TerminalControlRegisterBit = TerminalControlRegisterBit.NONE,
    wiperConnCtrlBit: TerminalControlRegisterBit = TerminalControlRegisterBit.NONE,
    channel: MicrochipPotChannel = MicrochipPotChannel.NONE,
  ) {
    this.mVolatileMemAddr = volatileMemAddr;
    this.mNonVolatileMemAddr = nonVolatileMemAddr;
    this.mTermConAddr = termConnAddr;
    this.mHwConfigCtrlBit = hwConfigAddr;
    this.mTermAConnCtrlBit = termAConnCtrlBit;
    this.mTermBConnCtrlBit = termBConnCtrlBit;
    this.mWiperConnCtrlBit = wiperConnCtrlBit;
    this.mChan = channel;
  }

  /**
   * Gets the volatile memory address.
   * @readonly
   */
  public get volatileMemoryAddress() {
    return this.mVolatileMemAddr;
  }

  /**
   * Gets the non-volatile memory address.
   * @readonly
   */
  public get nonVolatileMemoryAddress() {
    return this.mNonVolatileMemAddr;
  }

  /**
   * Gets the terminal control address.
   * @readonly
   */
  public get terminalControlAddress() {
    return this.mTermConAddr;
  }

  /**
   * Gets the hardware config control bit.
   * @readonly
   */
  public get hardwareConfigControlBit() {
    return this.mHwConfigCtrlBit;
  }

  /**
   * Gets the terminal A connection control bit.
   * @readonly
   */
  public get terminalAConnectionControlBit() {
    return this.mTermAConnCtrlBit;
  }

  /**
   * Gets the terminal B connection control bit.
   * @readonly
   */
  public get terminalBConnectionControlBit() {
    return this.mTermBConnCtrlBit;
  }

  /**
   * Gets the wiper connection control bit.
   * @readonly
   */
  public get wiperConnectionControlBit() {
    return this.mWiperConnCtrlBit;
  }

  /**
   * Gets the channel.
   * @readonly
   */
  public get channel() {
    return this.mChan;
  }

  /**
   * Gets the channel name.
   * @readonly
   */
  public get name() {
    if (this.mChan === MicrochipPotChannel.NONE) {
      return StringUtils.EMPTY;
    }

    return MicrochipPotChannel[this.mChan];
  }
}
