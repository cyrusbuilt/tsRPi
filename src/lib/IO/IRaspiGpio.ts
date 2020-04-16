import { BoardRevision } from '../BoardRevision';
import { GpioPins } from './GpioPins';
import IGpio from './IGpio';
import PinStateChangeEvent, {
  IPinStateChangeEventSubscription,
  PinStateChangeEventCallback,
} from './PinStateChangeEvent';

/**
 * A RaspberryPi GPIO interface.
 * @interface
 * @extends [[IGpio]]
 */
export default interface IRaspiGpio extends IGpio {
  /**
   * Gets the board revision.
   * @property
   * @readonly
   */
  revision: BoardRevision;

  /**
   * Gets the physical pin being represented by this instance.
   * @property
   * @readonly
   */
  innerPin: GpioPins;

  /**
   * In a derivative class, fires the pin state change event.
   * @param pse he event object.
   */
  onPinStateChange(pse: PinStateChangeEvent): void;

  /**
   * Attaches a listener (callback) for the pin state change event.
   * @param listener The event listener to register.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  addPinStateChangeListener(listener: PinStateChangeEventCallback): IPinStateChangeEventSubscription;
}
