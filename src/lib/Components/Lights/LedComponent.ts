import InvalidOperationException from '../../InvalidOperationException';
import { PinMode, PinState } from '../../IO';
import IGpio from '../../IO/IGpio';
import ObjectDisposedException from '../../ObjectDisposedException';
import Coreutils from '../../PiSystem/CoreUtils';
import SystemInfo from '../../PiSystem/SystemInfo';
import LedBase from './LedBase';
import LightStateChangeEvent from './LightStateChangeEvent';

const ON_STATE = PinState.HIGH;
const OFF_STATE = PinState.LOW;

/**
 * @classdesc A component that is an abstraction of an LED.
 * @extends [[LedBase]]
 */
export default class LedComponent extends LedBase {
  private blinkElapsed: number;
  private blinkDuration: number;
  private blinkDelay: number;
  private thePin: IGpio;
  private blinkTimer: NodeJS.Timeout | null;

  /**
   * Initializes a new instance of the [[LEDComponent]]
   * class with the pin the LED is attached to.
   * @param pin The output pin the LED is wired to.
   * @constructor
   */
  constructor(pin: IGpio) {
    super();
    this.thePin = pin;
    this.blinkElapsed = 0;
    this.blinkDuration = 0;
    this.blinkDelay = 0;
    this.blinkTimer = null;
  }

  /**
   * Gets the underlying pin the LED is attached to.
   * @readonly
   */
  public get pin() {
    return this.thePin;
  }

  /**
   * Gets a value indicating whether this light is on.
   * @readonly
   * @override
   */
  public get isOn() {
    return this.pin.state === ON_STATE;
  }

  /**
   * Initializes the LED component.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LedComponent');
    }
    await this.pin.provision();
  }

  /**
   * Switches the light on.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if the underlying pin is not
   * configured as an output.
   * @override
   */
  public async turnOn() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LedComponent');
    }

    if (this.pin.mode !== PinMode.OUT) {
      throw new InvalidOperationException('Pin is not configured as an output.');
    }

    if (this.pin.state !== ON_STATE) {
      await this.pin.write(ON_STATE);
      this.onLightStateChange(new LightStateChangeEvent(true));
    }
  }

  /**
   * Switches the light off.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if the underlying pin is not
   * configured as an output.
   * @override
   */
  public async turnOff() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LedComponent');
    }

    if (this.pin.mode !== PinMode.OUT) {
      throw new InvalidOperationException('Pin is not configured as an output.');
    }

    if (this.pin.state !== OFF_STATE) {
      await this.pin.write(OFF_STATE);
      this.onLightStateChange(new LightStateChangeEvent(false));
    }
  }

  /**
   * Blinks the LED.
   * @param delay The delay between state change.
   * @param duration The amount of time to blink the LED (in
   * milliseconds). If not specified, then a single blink will occur.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async blink(delay: number, duration: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LedComponent');
    }

    if (duration > 0) {
      this.blinkDuration = duration;
      this.blinkDelay = delay;
      this.blinkElapsed = SystemInfo.getCurrentTimeMillis();
      this.blinkTimer = setInterval(async () => {
        await this.doBlinkInterval();
      }, delay);
    } else {
      await this.blinkOnce(delay);
    }
  }

  /**
   * Pulses the state of the LED.
   * @param duration The amount of time to pulse the LED.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async pulse(duration: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LedComponent');
    }

    if (duration > 0) {
      await this.pin.pulse(duration);
    }
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.pin.dispose();
    this.resetBlink();
    super.dispose();
  }

  private resetBlink() {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkElapsed = 0;
      this.blinkDuration = 0;
      this.blinkDelay = 0;
      this.blinkTimer = null;
    }
  }

  private async blinkOnce(delay: number) {
    await this.turnOn();
    await Coreutils.delay(delay);
    await this.turnOff();
  }

  private async doBlinkInterval() {
    const millis = SystemInfo.getCurrentTimeMillis();
    if (millis - this.blinkElapsed <= this.blinkDuration) {
      this.blinkElapsed = millis;
      await this.blinkOnce(this.blinkDelay);
    }
  }
}
