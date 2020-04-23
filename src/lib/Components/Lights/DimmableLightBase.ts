import ObjectDisposedException from '../../ObjectDisposedException';
import ComponentBase from '../ComponentBase';
import IDimmableLight from './IDimmableLight';
import { LightEventTypes } from './ILight';
import LightLevelChangeEvent, {
  ILightLevelChangeEventSubscription,
  LightLevelChangeEventCallback,
} from './LightLevelChangeEvent';
import LightStateChangeEvent, {
  ILightStateChangeSubscription,
  LightStateChangeCallback,
} from './LightStateChangeEvent';

/**
 * Base class for dimmable light component abstractions.
 * @extends [[ComponentBase]]
 * @implements [[IDimmableLight]]
 */
export default abstract class DimmableLightBase extends ComponentBase implements IDimmableLight {
  /**
   * Initializes a new instance of the [[DimmableLightBase]] class.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Gets the brightness level.
   * @readonly
   * @override
   */
  public abstract get level(): number;

  /**
   * Gets the minimum brightness level.
   * @readonly
   * @override
   */
  public abstract get minLevel(): number;

  /**
   * Gets the maximum brightness level.
   * @readonly
   * @override
   */
  public abstract get maxLevel(): number;

  /**
   * Gets a value indicating whether this light is on. Returns true if the light
   * is on; Otherwise, false.
   * @readonly
   * @override
   */
  public get isOn() {
    return this.level > this.minLevel;
  }

  /**
   * Gets a value indicating whether this light is off.
   * @readonly
   * @override
   */
  public get isOff() {
    return this.level <= this.minLevel;
  }

  /**
   * Sets the brightness level.
   * @param level The brightness level.
   */
  public abstract setLevel(level: number): Promise<void>;

  /**
   * Switches the light on.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async turnOn() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    await this.setLevel(this.maxLevel);
  }

  /**
   * Switches the light off.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async turnOff() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    await this.setLevel(this.minLevel);
  }

  /**
   * Fires the light state change event.
   * @param lightChangeEvent The state change event object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onLightStateChange(lightChangeEvent: LightStateChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    this.emit(LightEventTypes.STATE_CHANGED, lightChangeEvent);
  }

  /**
   * Fires the light level change event.
   * @param levelChangeEvent The level change event object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onLightLevelChanged(levelChangeEvent: LightLevelChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    this.emit(LightEventTypes.LEVEL_CHANGED, levelChangeEvent);
  }

  /**
   * Gets the current brightness level percentage.
   * @param level The brightness level.
   * @returns The brightness percentage level.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public getLevelPercentage(level: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    if (level < this.minLevel) {
      level = this.minLevel;
    }

    if (level > this.maxLevel) {
      level = this.maxLevel;
    }

    const min = Math.min(this.minLevel, this.maxLevel);
    const max = Math.max(this.minLevel, this.maxLevel);
    const range = max - min;
    const percentage = (level * 100) / range;
    return percentage;
  }

  /**
   * Registers a listener for the light state change event.
   * @param listener The listener call back method to register.
   * @returns The event subscription object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addLightStateChangeEventListener(listener: LightStateChangeCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    const evt = this.on(LightEventTypes.STATE_CHANGED, listener);
    return {
      remove() {
        evt.removeListener(LightEventTypes.STATE_CHANGED, listener);
      },
    } as ILightStateChangeSubscription;
  }

  /**
   * Registers a listener for the light level change event.
   * @param listener listener call back method to register.
   * @returns The event subscription object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addLightLevelChangeEventListener(listener: LightLevelChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('DimmableLightBase');
    }

    const evt = this.on(LightEventTypes.LEVEL_CHANGED, listener);
    return {
      remove() {
        evt.removeListener(LightEventTypes.LEVEL_CHANGED, listener);
      },
    } as ILightLevelChangeEventSubscription;
  }
}
