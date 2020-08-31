import { MicrochipPotChannel } from './MicrochipPotChannel';

/**
 * Interface for the device-status concerning the channel an instance of Microchip
 * potentiometer is configured for.
 */
export default interface IMicrochipPotDeviceStatus {
  /**
   * Gets whether or not the device is currently writing to EEPROM.
   * @readonly
   */
  readonly isEepromWriteActive: boolean;

  /**
   * Gets a value indicating whether the EEPROM is write protected.
   * @readonly
   */
  readonly isEepromWriteProtected: boolean;

  /**
   * Gets the channel the wiper-lock-active status is for.
   * @readonly
   */
  readonly wiperLockChannel: MicrochipPotChannel;

  /**
   * Gets whether or not the wiper's lock is active.
   * @readonly
   */
  readonly wiperLockActive: boolean;
}
