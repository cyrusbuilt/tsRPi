import IPotentiometer from '../IPotentiometer';
import { MicrochipPotChannel } from './MicrochipPotChannel';
import { MicrochipPotNonVolatileMode } from './MicrochipPotNonVolatileMode';
import IMicrochipPotDeviceStatus from './IMicrochipPotDeviceStatus';
import MCPTerminalConfiguration from './MCPTerminalConfiguration';

/**
 * An MCP45XX or MCP46XX IC device abstraction interface.
 * @extends [[IPotentiometer]]
 */
export default interface IMicrochipPotentiometer extends IPotentiometer {
  /**
   * Gets the channel this device is configured for.
   * @readonly
   */
  readonly channel: MicrochipPotChannel;

  /**
   * Gets whether or not the device is capable of non-volatile wipers.
   * @readonly
   */
  readonly isNonVolatileWiperCapable: boolean;

  /**
   * Gets the way non-volatile reads and/or writes are done.
   * @readonly
   */
  readonly nonVolatileMode: MicrochipPotNonVolatileMode;

  /**
   * Gets the channels that are supported by the underlying device.
   * @readonly
   */
  readonly supportedChannels: MicrochipPotChannel[];

  /**
   * Updates the cache to the wiper's value.
   * @returns The current value.
   */
  updateCacheFromDevice(): Promise<number>;

  /**
   * Determines whether or not the specified channel is supported by
   * the underlying device.
   * @param channel The channel to check.
   * @returns true if the channel is supported; otherwise, false.
   */
  isChannelSupported(channel: MicrochipPotChannel): boolean;

  /**
   * Enables or disables the wiper lock.
   * @param enabled Set true to enable.
   */
  setWiperLock(enabled: boolean): Promise<void>;

  /**
   * Enables or disables write-protection for devices
   * capable of non-volatile memory. Enabling write-protection does not only
   * protect non-volatile wipers, it also protects any other non-volatile
   * information stored (i.e. wiper-locks).
   * @param enabled Set true to enable.
   */
  setWriteProtection(enabled: boolean): Promise<void>;

  /**
   * Gets the device and wiper status.
   */
  getDeviceStatus(): Promise<IMicrochipPotDeviceStatus>;

  /**
   * Gets the current terminal configuration.
   */
  getTerminalConfiguration(): Promise<MCPTerminalConfiguration>;

  /**
   * Sets the terminal configuration.
   * @param config The configuration to set.
   */
  setTerminalConfiguration(config: MCPTerminalConfiguration): Promise<void>;
}
