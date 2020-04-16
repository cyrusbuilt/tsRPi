import IDisposable from '../IDisposable';
import { PinState } from '../IO';

/**
 * LCD data transfer provider interface.
 * @interface
 * @extends [[IDisposable]]
 */
export default interface ILcdTransferProvider extends IDisposable {
  /**
   * In derived classes, Gets a value indicating whether this instance
   * is in four-bit mode.
   * @readonly
   */
  isFourBitMode: boolean;

  /**
   * Initializes the transfer provider.
   */
  begin(): Promise<void>;

  /**
   * In derived classes, send the specified data, mode and backlight.
   * @param data The data to send.
   * @param mode Mode for register-select pin (PinState.High =
   * on, PinState.Low = off).
   * @param backlight Turns on the backlight.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  send(data: number, mode: PinState, backlight: boolean): Promise<void>;
}
