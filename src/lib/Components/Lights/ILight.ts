import IComponent from '../IComponent';
import LightStateChangeEvent from './LightStateChangeEvent';

/**
 * Possible light event names.
 */
export const LightEventTypes = Object.freeze({
  /**
   * The name of the light state changed event.
   */
  STATE_CHANGED: 'lightStateChanged',

  /**
   * The name of the light level changed event.
   */
  LEVEL_CHANGED: 'lightLevelChanged',
});

/**
 * An interface for light abstraction components.
 * @extends [[IComponent]]
 */
export default interface ILight extends IComponent {
  /**
   * Gets a value indicating whether this light is on.
   * @readonly
   */
  readonly isOn: boolean;

  /**
   * Gets a value indicating whether this light is off.
   * @readonly
   */
  readonly isOff: boolean;

  /**
   * Switches the light on.
   */
  turnOn(): Promise<void>;

  /**
   * Switches the light off.
   */
  turnOff(): Promise<void>;

  /**
   * Fires the light state change event.
   * @param lightChangeEvent The state change event object.
   */
  onLightStateChange(lightChangeEvent: LightStateChangeEvent): void;
}
