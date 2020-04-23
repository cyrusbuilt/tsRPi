import IGpio from '../../IO/IGpio';
import ObjectDisposedException from '../../ObjectDisposedException';
import DimmableLightBase from './DimmableLightBase';
import LightLevelChangeEvent from './LightLevelChangeEvent';
import LightStateChangeEvent from './LightStateChangeEvent';

/**
 * @classdesc A component that is an abstraction of a dimmable light.
 * @extends [[DimmableLightBase]]
 */
export default class DimmableLightComponent extends DimmableLightBase {
  private lightPin: IGpio;
  private min: number;
  private max: number;

  /**
   * Initializes a new instance of the [[DimmableLightComponent]]
   * class with the pin the light is attached to and the minimum and maximum
   * brightness levels.
   * @param pin The pin used to control the dimmable light.
   * @param min The minimum brightness level.
   * @param max The maximum brightness level.
   * @constructor
   */
  constructor(pin: IGpio, min: number, max: number) {
    super();

    this.lightPin = pin;
    this.min = min;
    this.max = max;
  }

  /**
   * Gets the minimum brightness level.
   * @readonly
   * @override
   */
  public get minLevel() {
    return this.min;
  }

  /**
   * Gets the maximum brightness level.
   * @readonly
   * @override
   */
  public get maxLevel() {
    return this.max;
  }

  /**
   * Gets the brightness level.
   * @readonly
   * @override
   */
  public get level() {
    if (this.lightPin.isDisposed) {
      return 0;
    }

    return this.lightPin.pwm;
  }

  /**
   * Initializes the dimmable light component.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightComponent');
    }

    await this.lightPin.provision();
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.lightPin.dispose();
    this.min = 0;
    this.max = 0;
    super.dispose();
  }

  /**
   * Sets the light level.
   * @param level The light level.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[RangeError]] if the specified level is less than the minimum
   * or greater than the maximum.
   * @override
   */
  public async setLevel(level: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightComponent');
    }

    if (level < this.min) {
      throw new RangeError('Level cannot be less than minLevel');
    }

    if (level > this.max) {
      throw new RangeError('Level cannot be greater than maxLevel');
    }

    const isOnBeforeChange = this.isOn;
    await this.lightPin.setPwm(level);
    const isOnAfterChange = this.isOn;
    this.onLightLevelChanged(new LightLevelChangeEvent(level));
    if (isOnBeforeChange !== isOnAfterChange) {
      this.onLightStateChange(new LightStateChangeEvent(isOnAfterChange));
    }
  }
}
