import IDisposable from '../IDisposable';
import { PinMode } from '../IO/PinMode';
import { PinState } from '../IO/PinState';

/**
 * A physical pin interface.
 * @interface
 * @extends [[IDisposable]]
 */
export default interface IPin extends IDisposable {
  /**
   * Gets the pin name.
   * @property
   * @readonly
   */
  pinName: string;

  /**
   * Gets or sets the tag.
   * @property
   */
  tag: any;

  /**
   * Gets the pin state.
   * @property
   * @readonly
   */
  state: PinState;

  /**
   * Gets or sets the pin mode.
   * @property
   */
  mode: PinMode;

  /**
   * Gets the pin address.
   * @property
   * @readonly
   */
  address: number;
}
