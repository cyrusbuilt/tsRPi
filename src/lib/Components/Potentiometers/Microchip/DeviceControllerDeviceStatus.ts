/**
 * @classdesc The device's status.
 */
export default class DeviceControllerDeviceStatus {
  private mEepromWriteActive: boolean;
  private mEepromWriteProtected: boolean;
  private mChannelALocked: boolean;
  private mChannelBLocked: boolean;

  /**
   * Initializes a new instance of the [[DeviceControllerDeviceStatus]]
   * class with whether or not the EEPROM is actively writing, whether or not
   * the EEPROM is write-protected, whether or not channel A is locked, and
   * whether or not channel B is locked.
   * @param writeActive Set true if actively writing the EEPROM.
   * @param writeProtected Set true if the EEPROM is write-protected.
   * @param chanALocked Set true if channel A is locked.
   * @param chanBLocked Set true if channel B is locked.
   * @constructor
   */
  constructor(
    writeActive: boolean = false,
    writeProtected: boolean = false,
    chanALocked: boolean = false,
    chanBLocked: boolean = false,
  ) {
    this.mEepromWriteActive = writeActive;
    this.mEepromWriteProtected = writeProtected;
    this.mChannelALocked = chanALocked;
    this.mChannelBLocked = chanBLocked;
  }

  /**
   * Gets a value indicating whether nor not the EEPROM is actively writing.
   * @readonly
   */
  public get eepromWriteActive() {
    return this.mEepromWriteActive;
  }

  /**
   * Gets a value indicating whether or not the EEPROM is write-protected.
   * @readonly
   */
  public get eepromWriteProtected() {
    return this.mEepromWriteProtected;
  }

  /**
   * Gets a value indicating whether or not channel A is locked.
   * @readonly
   */
  public get channelALocked() {
    return this.mChannelALocked;
  }

  /**
   * Gets a value indicating whether or not channel B is locked.
   * @readonly
   */
  public get channelBLocked() {
    return this.mChannelBLocked;
  }
}
