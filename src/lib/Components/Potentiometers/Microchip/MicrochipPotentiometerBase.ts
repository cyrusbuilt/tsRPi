import ComponentBase from '../../ComponentBase';
import IMicrochipPotentiometer from './IMicrochipPotentiometer';
import { MicrochipPotChannel } from './MicrochipPotChannel';
import { MicrochipPotNonVolatileMode } from './MicrochipPotNonVolatileMode';
import MicrochipPotDeviceController from './MicrochipPotDeviceController';
import II2C from '../../../IO/I2C/II2C';
import WiperEvent, { WiperEventCallback, IWiperEventSubscription } from './WiperEvent';
import ObjectDisposedException from '../../../ObjectDisposedException';
import DeviceControlChannel from './DeviceControlChannel';
import MicrochipPotDeviceStatus from './MicrochipPotDeviceStatus';
import MCPTerminalConfiguration from './MCPTerminalConfiguration';
import InvalidOperationException from '../../../InvalidOperationException';
import IllegalArgumentException from '../../../IllegalArgumentException';
import DeviceControllerTerminalConfiguration from './DeviceControllerTerminalConfiguration';

const WIPER_ACTION_EVENT = 'wiperActionEvent';

/**
 * @classdesc Base class for Microchip MCP45XX and MCP46XX IC device
 * abstraction components.
 * @extends [[ComponentBase]]
 * @implements [[IMicrochipPotentiometer]]
 */
export default abstract class MicrochipPotentiometerBase extends ComponentBase implements IMicrochipPotentiometer {
  /**
   * The value which is used for address-bit if the device's package does
   * not provide a matching address pin.
   */
  protected static readonly PIN_NOT_AVAILABLE = true;

  /**
   * The value which is used for devices capable of non-volatile wipers.
   * For those devices, the initial value is loaded from EEPROM.
   */
  protected static readonly INITIALVALUE_LOADED_FROM_EEPROM = 0;

  /**
   * Builds the I2C bus address of the device based on which which address
   * pins are set.
   * @param pinA0 Whether the device's address pin A0 is high (true) or low (false).
   * @param pinA1 Whether the device's address pin A1 (if available) is high (true) or low (false).
   * @param pinA2 Whether the device's address pin A2 (if available) is high (true) or low (false).
   * @returns The I2C-address based on the address-pins given.
   */
  protected static buildI2Caddress(pinA0: boolean = false, pinA1: boolean = false, pinA2: boolean = false) {
    // Constant component.
    let i2cAddress = 0x0101000;

    // Dynamic component if device knows A0.
    if (pinA0) {
      i2cAddress |= 0x0000001;
    }

    // Dynamic component if device knows A1.
    if (pinA1) {
      i2cAddress |= 0x0000010;
    }

    // Dynamic component if device knows A2.
    if (pinA2) {
      i2cAddress |= 0x0000100;
    }
    return i2cAddress;
  }

  private mChannel: MicrochipPotChannel;
  private mCurrentValue: number;
  private mInitValue: number;
  private mNonVolMode: MicrochipPotNonVolatileMode;
  private mController: MicrochipPotDeviceController;
  private mEventSub: IWiperEventSubscription | null;

  /**
   * Initializes a new instance of the MicrochipPotentiometerBase class with
   * the I2C device connection, pin A0, A1, and A2 states, the potentiometer
   * (channel) provided by the device, how to do non-volatile I/O and the
   * initial value for devices which are not capable of non-volatile wipers.
   * @param device The I2C bus device this instance is connected to.
   * @param pinA0 Whether the device's address pin A0 is high (true) or low (false).
   * @param pinA1 Whether the device's address pin A1 is high (true) or low (false).
   * @param pinA2 Whether the device's address pin A2 is high (true) or low (false).
   * @param channel Which of the potentiometers provided by the device to control.
   * @param nonVolatileMode The way non-volatile reads or writes are done.
   * @param initialNonVolWiperValue The value for devices which are not capable of non-volatile wipers.
   * @param props A collection of component properties (optional).
   * @constructor
   */
  constructor(
    device: II2C,
    pinA0: boolean = false,
    pinA1: boolean = false,
    pinA2: boolean = false,
    channel: MicrochipPotChannel = MicrochipPotChannel.NONE,
    nonVolatileMode: MicrochipPotNonVolatileMode = MicrochipPotNonVolatileMode.VOLATILE_AND_NON_VOLATILE,
    initialNonVolWiperValue: number = 0,
    props?: Map<string, any>,
  ) {
    super(props);
    this.mChannel = channel;
    this.mCurrentValue = 0;
    this.mNonVolMode = nonVolatileMode;
    const deviceAddr = MicrochipPotentiometerBase.buildI2Caddress(pinA0, pinA1, pinA2);
    this.mController = new MicrochipPotDeviceController(device, deviceAddr);
    this.mInitValue = initialNonVolWiperValue;
    this.mEventSub = null;
  }

  /**
   * Gets whether or not the device is capable of non-volatile wipers.
   * @readonly
   * @override
   */
  public abstract get isNonVolatileWiperCapable(): boolean;

  /**
   * Gets the maximum wiper-value supported by the device.
   * @readonly
   * @override
   */
  public abstract get maxValue(): number;

  /**
   * Gets the way non-volatile reads and/or writes are done.
   * @readonly
   * @override
   */
  public get nonVolatileMode() {
    return this.mNonVolMode;
  }

  /**
   * Gets the channel this device is configured for.
   * @readonly
   * @override
   */
  public get channel() {
    return this.mChannel;
  }

  /**
   * Gets the channels that are supported by the underlying device.
   * @readonly
   * @override
   */
  public abstract get supportedChannels(): MicrochipPotChannel[];

  /**
   * Gets whether the device is a potentiometer or a rheostat.
   * @readonly
   * @override
   */
  public abstract get isRheostat(): boolean;

  /**
   * ets or sets the wiper's current value.
   * @override
   */
  public get currentValue() {
    return this.mCurrentValue;
  }

  public set currentValue(val: number) {
    // Check boundaries
    const newVal = this.getValueAccordingBoundaries(val);

    // Set wipers according to mode.
    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      this.fireWiperActionEvent(new WiperEvent(chan, this.mController, newVal));

      // Set value only if volatile wiper is affected.
      if (this.mNonVolMode === MicrochipPotNonVolatileMode.NON_VOLATILE_ONLY) {
        return;
      }
    }

    this.mCurrentValue = newVal;
  }

  /**
   * Registers a listener callback for wiper events.
   * @param listener The callback to register as the event handler.
   * @returns A subscription object used to remove the listener later.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addWiperEventSubscription(listener: WiperEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const evt = this.on(WIPER_ACTION_EVENT, listener);
    return {
      remove() {
        evt.removeListener(WIPER_ACTION_EVENT, listener);
      },
    } as IWiperEventSubscription;
  }

  /**
   * Initializes the potentiometer.  This should be called before attempting
   * to read/write the potentiometer.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    this.mEventSub = this.addWiperEventSubscription(async (evt: WiperEvent) => {
      await this.onWiperActionEvent(evt);
    });
    await this.initialize(this.mInitValue);
  }

  /**
   * Disposes all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.mController.dispose();
    this.mCurrentValue = 0;
    this.mChannel = MicrochipPotChannel.NONE;
    this.mNonVolMode = MicrochipPotNonVolatileMode.VOLATILE_AND_NON_VOLATILE;
    if (this.mEventSub) {
      this.mEventSub.remove();
    }
    super.dispose();
  }

  /**
   * Gets the device status.
   * @returns The current device status.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async getDeviceStatus() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const devStat = await this.mController.getDeviceStatus();
    const wiperLockActive = this.mChannel === MicrochipPotChannel.A ? devStat.channelALocked : devStat.channelBLocked;
    return new MicrochipPotDeviceStatus(
      this.mChannel,
      devStat.eepromWriteActive,
      devStat.eepromWriteProtected,
      wiperLockActive,
    );
  }

  /**
   * Gets the terminal configuration of the potentiometer.
   * @returns The current terminal configuration.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if an attempt is made to retrieve
   * a terminal configuration for a null channel.
   * @override
   */
  public async getTerminalConfiguration() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      const tcon = await this.mController.getTerminalConfiguration(chan);
      return new MCPTerminalConfiguration(
        this.mChannel,
        tcon.channelEnabled,
        tcon.pinAEnabled,
        tcon.pinWEnabled,
        tcon.pinBEnabled,
      );
    }

    throw new InvalidOperationException('Cannot retrieve terminal config for null channel.');
  }

  /**
   * Sets the terminal configuration.
   * @param config The configuration to set.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IllegalArgumentException]] if setting an invalid channel.
   * @override
   */
  public async setTerminalConfiguration(config: MCPTerminalConfiguration) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    if (config.channel !== this.mChannel) {
      throw new IllegalArgumentException(
        'Setting a configuration with a channel ' + "that is not the potentiometer's channel is not supported.",
      );
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      const devCon = new DeviceControllerTerminalConfiguration(
        chan,
        config.isChannelEnabled,
        config.isPinAenabled,
        config.isPinBenabled,
        config.isPinWenabled,
      );
      await this.mController.setTerminalConfiguration(devCon);
    }
  }

  /**
   * Updates the cache to the wiper's value.
   * @returns The current value.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async updateCacheFromDevice() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      this.mCurrentValue = await this.mController.getValue(chan, false);
      return this.mCurrentValue;
    }

    return 0;
  }

  /**
   * Determines whether or not the specified channel is supported by
   * the underlying device.
   * @param channel The channel to check.
   * @returns true if the channel is supported; otherwise, false.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public isChannelSupported(channel: MicrochipPotChannel) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    let supported = false;
    for (const chan of this.supportedChannels) {
      if (channel === chan) {
        supported = true;
        break;
      }
    }

    return supported;
  }

  /**
   * Decreases the wiper's value by the specified number of
   * steps. It is not an error if the wiper hits or already
   * hit the lower boundary (0). In such situations, the
   * wiper sticks to the lower boundary or doesn't change.
   * @param steps The number of steps to decrease by. If not
   * specified or zero, then defaults to 1.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IllegalArgumentException]] if a negative step value is specified.
   * @throws [[InvalidOperationException]] if the non-volatile mode is anything
   * other than VOLATILE_ONLY.
   * @override
   */
  public async decrease(steps: number = 1) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    if (this.mCurrentValue === 0) {
      return;
    }

    if (steps < 0) {
      throw new IllegalArgumentException('Only positive integer values are permitted.');
    }

    if (this.nonVolatileMode !== MicrochipPotNonVolatileMode.VOLATILE_ONLY) {
      throw new InvalidOperationException('Decrease is only permitted for volatile-only wipers.');
    }

    // Check boundaries.
    let actualSteps = steps;
    if (steps > this.mCurrentValue) {
      actualSteps = this.mCurrentValue;
    }

    const newVal = this.mCurrentValue - actualSteps;
    if (newVal === 0 || steps > 5) {
      this.currentValue = newVal;
    } else {
      const chan = DeviceControlChannel.valueOf(this.mChannel);
      if (chan) {
        await this.mController.decrease(chan, actualSteps);
        this.mCurrentValue = newVal;
      }
    }
  }

  /**
   * Increases the wiper's value by the specified number of steps.
   * It is not an error if the wiper hits or already hit the upper
   * boundary. In such situations, the wiper sticks to the upper
   * boundary or doesn't change.
   * @param steps How many steps to increase. If not specified
   * or zero then defaults to 1. If the current value is equal to the max
   * value, then nothing happens. If steps is less than zero, than an
   * exception is thrown.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IllegalArgumentException]] if a negative step value is specified.
   * @throws [[InvalidOperationException]] if the non-volatile mode is anything
   * other than VOLATILE_ONLY.
   * @override
   */
  public async increase(steps: number = 1) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const maxVal = this.maxValue;
    if (this.mCurrentValue === maxVal) {
      return;
    }

    if (steps < 0) {
      throw new IllegalArgumentException('Only positive integer values are permitted.');
    }

    if (this.nonVolatileMode !== MicrochipPotNonVolatileMode.VOLATILE_ONLY) {
      throw new InvalidOperationException('Increase is only permitted for volatile-only wipers.');
    }

    // Check boundaries.
    let actualSteps = steps;
    if (steps + this.mCurrentValue > maxVal) {
      actualSteps = maxVal - this.mCurrentValue;
    }

    const newVal = this.mCurrentValue + actualSteps;
    if (newVal === maxVal || steps > 5) {
      this.currentValue = newVal;
    } else {
      const chan = DeviceControlChannel.valueOf(this.mChannel);
      if (chan) {
        await this.mController.increase(chan, actualSteps);
        this.mCurrentValue = newVal;
      }
    }
  }

  /**
   * Enables or disables the wiper lock.
   * @param enabled Set true to enable.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async setWiperLock(enabled: boolean) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      await this.mController.setWiperLock(chan, enabled);
    }
  }

  /**
   * Enables or disables write-protection for devices
   * capable of non-volatile memory. Enabling write-protection does not only
   * protect non-volatile wipers, it also protects any other non-volatile
   * information stored (i.e. wiper-locks).
   * @param enabled Set true to enable.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async setWriteProtection(enabled: boolean) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      await this.mController.setWriteProtection(enabled);
    }
  }

  private getValueAccordingBoundaries(val: number = 0) {
    let newVal = 0;
    if (val < 0) {
      val = 0;
    }

    if (val > this.maxValue) {
      newVal = this.maxValue;
    } else {
      newVal = val;
    }

    return newVal;
  }

  private async initialize(initialValForNonVolWipers: number) {
    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      if (this.isNonVolatileWiperCapable) {
        this.mCurrentValue = await this.mController.getValue(chan, true);
      } else {
        const newInitialWiperVal = this.getValueAccordingBoundaries(initialValForNonVolWipers);
        await this.mController.setValue(chan, newInitialWiperVal, MicrochipPotDeviceController.VOLATILE_WIPER);
        this.mCurrentValue = newInitialWiperVal;
      }
    }
  }

  private async onWiperActionEvent(wiperEvent: WiperEvent) {
    switch (this.mNonVolMode) {
      case MicrochipPotNonVolatileMode.VOLATILE_ONLY:
      case MicrochipPotNonVolatileMode.VOLATILE_AND_NON_VOLATILE:
        await wiperEvent.setChannelValue(MicrochipPotDeviceController.VOLATILE_WIPER);
        break;
      case MicrochipPotNonVolatileMode.NON_VOLATILE_ONLY:
      default:
        break;
    }

    switch (this.mNonVolMode) {
      case MicrochipPotNonVolatileMode.NON_VOLATILE_ONLY:
      case MicrochipPotNonVolatileMode.VOLATILE_AND_NON_VOLATILE:
        await wiperEvent.setChannelValue(MicrochipPotDeviceController.NONVOLATILE_WIPER);
        break;
      case MicrochipPotNonVolatileMode.VOLATILE_ONLY:
      default:
        break;
    }
  }

  private fireWiperActionEvent(wiperEvent: WiperEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MicrochipPotentiometerBase');
    }

    setImmediate(() => {
      this.emit(WIPER_ACTION_EVENT, wiperEvent);
    });
  }

  private setNonVolatileMode(mode: MicrochipPotNonVolatileMode) {
    if (!this.isNonVolatileWiperCapable && this.mNonVolMode !== MicrochipPotNonVolatileMode.VOLATILE_ONLY) {
      throw new InvalidOperationException(
        'This device is not capable of non-volatile wipers.' +
          ' You *must* use MicrochipPotNonVolatileMode.VOLATILE_ONLY.',
      );
    }

    this.mNonVolMode = mode;
  }

  private async getNonVolatileValue() {
    if (!this.isNonVolatileWiperCapable) {
      throw new InvalidOperationException('This device is not capable of non-volatile wipers!');
    }

    const chan = DeviceControlChannel.valueOf(this.mChannel);
    if (chan) {
      const val = await this.mController.getValue(chan, true);
      return val;
    }

    return 0;
  }
}
