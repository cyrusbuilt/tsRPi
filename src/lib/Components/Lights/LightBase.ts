import ObjectDisposedException from '../../ObjectDisposedException';
import ComponentBase from '../ComponentBase';
import ILight, { LightEventTypes } from './ILight';
import LightStateChangeEvent, {
  ILightStateChangeSubscription,
  LightStateChangeCallback,
} from './LightStateChangeEvent';

/**
 * @classdesc Base class for light component abstractions.
 * @extends [[ComponentBase]]
 * @implements [[ILight]]
 */
export default abstract class LightBase extends ComponentBase implements ILight {
  private lightOn: boolean;

  /**
   * Initializes a new instance of the [[LightBase]] class.
   * @constructor
   */
  constructor() {
    super();
    this.lightOn = false;
  }

  /**
   * Gets a value indicating whether this light is on.
   * @readonly
   * @override
   */
  public get isOn() {
    return this.lightOn;
  }

  /**
   * Gets a value indicating whether this light is off.
   * @readonly
   * @override
   */
  public get isOff() {
    return !this.isOn;
  }

  /**
   * Switches the light on.
   * @override
   */
  public abstract turnOn(): Promise<void>;

  /**
   * Switches the light off.
   */
  public abstract turnOff(): Promise<void>;

  /**
   * Fires the light state change event.
   * @param lightChangeEvent The state change event object.
   * @throws [[ObjectDisposedException]] if this instance is disposed.
   * @override
   */
  public onLightStateChange(lightChangeEvent: LightStateChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LightBase');
    }

    this.emit(LightEventTypes.STATE_CHANGED, lightChangeEvent);
  }

  /**
   * Registers an event handler for the state change event.
   * @param listener The event handler callback.
   * @returns The event subscription object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addStateChangeEventListener(listener: LightStateChangeCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LightBase');
    }

    const evt = this.on(LightEventTypes.STATE_CHANGED, listener);
    return {
      remove() {
        evt.removeListener(LightEventTypes.STATE_CHANGED, listener);
      },
    } as ILightStateChangeSubscription;
  }
}
