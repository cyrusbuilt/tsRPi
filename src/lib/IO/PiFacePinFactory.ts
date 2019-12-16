import PiFaceGpioDigital from './PiFaceGpioDigital';
import { PiFacePins } from './PiFacePins';
import { PinMode } from './PinMode';
import { PinPullResistance } from './PinPullResistance';
import { PinState } from './PinState';

/**
 * @classdesc Contains factory methods for creating PiFace digital I/O's.
 */
export default class PiFacePinFactory {
  /**
   * Factory method for creating a PiFace digital output pin.
   * @param pin The pin to create an output for.
   * @param test Optional flag that when set true will create a pin on a mock
   * SPI bus useful for unit testing (especially on non-Linux platforms or
   * if not running on a physical Raspberry Pi with SPI enabled).
   * @returns A PiFace digital output.
   */
  public static async createOutputPin(pin: PiFacePins, test?: boolean) {
    const pfgd = new PiFaceGpioDigital(pin, PinState.LOW, pin.valueOf(), PiFaceGpioDigital.SPI_SPEED, test);
    await pfgd.initialize();
    pfgd.mode = PinMode.OUT;
    pfgd.pullResistance = PinPullResistance.OFF;
    return pfgd;
  }

  /**
   * Factory method for creating a PiFace digital input pin.
   * @param pin The pin to create an input for.
   * @param test Optional flag that when set true will create a pin on a mock
   * SPI bus useful for unit testing (especially on non-Linux platforms or
   * if not running on a physical Raspberry Pi with SPI enabled).
   * @returns A PiFace digital input.
   */
  public static async createInputPin(pin: PiFacePins, test?: boolean) {
    const pfgd = new PiFaceGpioDigital(pin, PinState.LOW, pin.valueOf(), PiFaceGpioDigital.SPI_SPEED, test);
    await pfgd.initialize();
    pfgd.mode = PinMode.IN;
    pfgd.pullResistance = PinPullResistance.PULL_UP;
    return pfgd;
  }

  private constructor() {}
}
