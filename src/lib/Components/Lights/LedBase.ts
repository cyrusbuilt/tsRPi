import ILed from './ILed';
import LightBase from './LightBase';

/**
 * @classdesc Base class for LED component abstractions.
 * @extends [[LightBase]]
 * @implements [[ILed]]
 */
export default abstract class LedBase extends LightBase implements ILed {
  /**
   * Initializes a new instance of [[LedBase]] class.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Toggles the state of the LED.
   * @override
   */
  public async toggle() {
    if (this.isOn) {
      await this.turnOff();
    } else {
      await this.turnOn();
    }
  }

  /**
   * Pulses the state of the LED.
   * @param duration The amount of time to pulse the LED.
   * @override
   */
  public abstract pulse(duration: number): Promise<void>;

  /**
   * Blinks the LED.
   * @param delay The delay between state change.
   * @param duration The amount of time to blink the LED (in milliseconds).
   * @override
   */
  public abstract blink(delay: number, duration: number): Promise<void>;
}
