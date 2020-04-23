import ILight from './ILight';

/**
 * An interface for LED abstraction components.
 * @extends [[ILight]]
 */
export default interface ILed extends ILight {
  /**
   * Toggles the state of the LED.
   */
  toggle(): Promise<void>;

  /**
   * Blinks the LED.
   * @param delay The delay between state change.
   * @param duration The amount of time to blink the LED (in milliseconds).
   */
  blink(delay: number, duration: number): Promise<void>;

  /**
   * Pulses the state of the LED.
   * @param duration The amount of time to pulse the LED.
   */
  pulse(duration: number): Promise<void>;
}
