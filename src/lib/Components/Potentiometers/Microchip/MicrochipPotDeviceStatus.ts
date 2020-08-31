import IMicrochipPotDeviceStatus from './IMicrochipPotDeviceStatus';
import { MicrochipPotChannel } from './MicrochipPotChannel';

/**
 * @classdesc The device-status concerning the channel an instance of Microchip
 * potentiometer is configured for.
 * @implements [[IMicrochipPotDeviceStatus]]
 */
export default class MicrochipPotDeviceStatus implements IMicrochipPotDeviceStatus {
  private mChannel: MicrochipPotChannel;
  private mEepromWriteActive: boolean;
  private mEepromWriteProtected: boolean;
  private mWiperLockActive: boolean;

  /**
   * Initializes a new instance of the [[MicrochipPotDeviceStatus]]
   * class with the wiper-lock channel and flags to indicate if currently
   * writing to the EEPROM, whether or not the EEPROM is write-protected,
   * and whether or not the wiper is locked.
   * @param chan The wiper-lock channel.
   * @param writeActive Set true if currently writing the EEPROM.
   * @param writeProtected Set true if the EEPROM is write-protected.
   * @param wiperLocked Set true if the wiper is locked.
   * @constructor
   */
  constructor(chan: MicrochipPotChannel, writeActive: boolean, writeProtected: boolean, wiperLocked: boolean) {
    this.mChannel = chan;
    this.mEepromWriteActive = writeActive;
    this.mEepromWriteProtected = writeProtected;
    this.mWiperLockActive = wiperLocked;
  }

  /**
   * Gets whether or not the device is currently writing to EEPROM.
   * @readonly
   * @override
   */
  public get isEepromWriteActive() {
    return this.mEepromWriteActive;
  }

  /**
   * Gets a value indicating whether the EEPROM is write protected.
   * @readonly
   * @override
   */
  public get isEepromWriteProtected() {
    return this.mEepromWriteProtected;
  }

  /**
   * Gets the channel the wiper-lock-active status is for.
   * @readonly
   * @override
   */
  public get wiperLockChannel() {
    return this.mChannel;
  }

  /**
   * Gets whether or not the wiper's lock is active.
   * @readonly
   * @override
   */
  public get wiperLockActive() {
    return this.mWiperLockActive;
  }
}
