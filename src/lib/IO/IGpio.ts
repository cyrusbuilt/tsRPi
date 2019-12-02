import IPin from './IPin';
import { PinState } from './PinState';

/**
 * Implemented by classes that represent GPIO pins on the Raspberry Pi.
 * @interface
 */
export default interface IGpio extends IPin {
  /**
   * Gets or sets the PWM (Pulse-Width Modulation) value.
   * @property
   */
  pwm: number;

  /**
   * Gets or sets the PWM range.
   * @property
   */
  pwmRange: number;

  /**
   * Write a value to the pin.
   * @param ps The pin state value to write to the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  write(ps: PinState): Promise<void>;

  /**
   * Pulse the pin output for the specified number of milliseconds.
   * @param millis The number of milliseconds to wait between states.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  pulse(millis: number): Promise<void>;

  /**
   * Reads a value from the pin.
   * @return The state (value) of the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  read(): Promise<PinState>;

  /**
   * Provisions the I/O pin. See http://wiringpi.com/reference/raspberry-pi-specifics/
   */
  provision(): Promise<void>;
}
