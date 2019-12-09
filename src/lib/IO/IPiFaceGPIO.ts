import IGpio from './IGpio';
import { PiFacePins } from './PiFacePins';

/**
 * Implemented by classes that represent GPIO pins on the PiFace expansion
 * board for the Raspberry Pi.
 * @interface
 * @extends [[IGpio]]
 */
export default interface IPiFaceGPIO extends IGpio {
  /**
   * Gets the inner pin.
   * @property
   * @readonly
   */
  innerPin: PiFacePins;
}
