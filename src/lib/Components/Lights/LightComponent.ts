import InvalidOperationException from '../../InvalidOperationException';
import { PinMode, PinState } from '../../IO';
import IGpio from '../../IO/IGpio';
import ObjectDisposedException from '../../ObjectDisposedException';
import LightBase from './LightBase';
import LightStateChangeEvent from './LightStateChangeEvent';

const ON_STATE = PinState.HIGH;
const OFF_STATE = PinState.LOW;

/**
 * @classdesc A component that is an abstraction of a light.
 * @extends [[LightBase]]
 */
export default class LightComponent extends LightBase {
  private pin: IGpio;

  /**
   * Initializes a new instance of the [[LightComponent]]
   * class with the pin that the light is attached to.
   * @param pin The output pin the light is wired to.
   * @constructor
   */
  constructor(pin: IGpio) {
    super();
    this.pin = pin;
  }

  /**
   * Init the light component.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LightComponent');
    }
    await this.pin.provision();
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
   * Releases all managed resources used by this instance.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.pin.dispose();
    super.dispose();
  }

  /**
   * Switches the light on.
   * @throws [[ObjectDisposedException]] if this instance is disposed.
   * @throws [[InvalidOperationException]] if the pin is not configured as
   * an output pin.
   */
  public async turnOn() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LightComponent');
    }

    if (this.pin.mode !== PinMode.OUT) {
      throw new InvalidOperationException('Pin is not configured as an output pin.');
    }

    if (this.pin.state !== ON_STATE) {
      await this.pin.write(ON_STATE);
      this.onLightStateChange(new LightStateChangeEvent(true));
    }
  }

  /**
   * Switches the light off.
   * @throws [[ObjectDisposedException]] if this instance is disposed.
   * @throws [[InvalidOperationException]] if the pin is not configured as
   * an output pin.
   */
  public async turnOff() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LightComponent');
    }

    if (this.pin.mode !== PinMode.OUT) {
      throw new InvalidOperationException('Pin is not configured as an output pin.');
    }

    if (this.pin.state !== OFF_STATE) {
      await this.pin.write(OFF_STATE);
      this.onLightStateChange(new LightStateChangeEvent(false));
    }
  }
}
