import { PinState } from '../IO';
import IRaspiGpio from '../IO/IRaspiGpio';
import ObjectDisposedException from '../ObjectDisposedException';
import StringUtils from '../StringUtils';
import { TM1638LedColor } from './TM1638LedColor';
import TM16XXBase from './TM16XXBase';

/**
 * @classdesc Controller class for the TM1638/TM1640 board.
 * It is a port of the TM1638 library by Ricardo Batista
 * URL: http://code.google.com/p/tm1638-library/
 * @extends [[TM16XXBase]]
 */
export default class TM1638 extends TM16XXBase {
  /**
   * Initializes a new instance of the jsrpi.LED.TM1638 class with the with the
   * pins for data, clock, and strobe, a flag indicating whether or not the
   * display should be active, and the intensity level.
   * @param data The data pin.
   * @param clock The clock pin.
   * @param strobe The strobe pin.
   * @param intensity The display intensity (brightness).
   * @param displays The number of characters supported.
   * @param activate Set true to activate the display.
   */
  constructor(
    data: IRaspiGpio,
    clock: IRaspiGpio,
    strobe: IRaspiGpio,
    intensity: number,
    displays: number = 0,
    activate: boolean = true,
  ) {
    super(data, clock, strobe, intensity, displays, activate);
  }

  /**
   * Sets the display to hex number.
   * @param num An unsigned long number to display (gets converted
   * to hex).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToHexNumber(num: number) {
    await super.setDisplayToString(`0x${num.toString(16)}`);
  }

  /**
   * Sets the display to a decimal number at the specified starting position.
   * @param num The number to set in the display (if out of
   * range, display will be cleared).
   * @param dots Set true to turn on dots.
   * @param startPos The starting position to place the number at.
   * @param leadingZeros Set true to lead the number with zeros.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToDecNumberAt(num: number, dots: boolean, startPos: number, leadingZeros: boolean) {
    if (num > 99999999) {
      await this.setDisplayToError();
    } else {
      let digit = 0;
      let pos = 0;
      let ldot = false;
      const displays = this.charCount;
      for (let i = 0; i < displays - startPos; i++) {
        pos = displays - i - 1;
        ldot = (dots ? 0 : 1 & (1 << i)) !== 0;
        if (num !== 0) {
          digit = num % 10;
          await super.setDisplayDigit(digit, pos, ldot);
          num /= 10;
        } else {
          if (leadingZeros) {
            digit = 0;
            await super.setDisplayDigit(digit, pos, ldot);
          } else {
            await super.clearDisplayDigit(pos, ldot);
          }
        }
      }
    }
  }

  /**
   * Sets the display to a decimal number.
   * @param num The number to set in the display.
   * @param dots Set true to turn on the dots.
   * @param leadingZeros Set true to lead the number with zeros.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToDecNumber(num: number, dots: boolean, leadingZeros: boolean) {
    await this.setDisplayToDecNumberAt(num, dots, 0, leadingZeros);
  }

  /**
   * Sends a character to the display.
   * @param pos The position at which to set the character.
   * @param data The data (character) to set in the display.
   * @param dot Set true to turn on the dots.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async sendChar(pos: number, data: number, dot: boolean) {
    const address = pos << 1;
    const one = this.convertByteArrayToNumber(StringUtils.convertStringToByte('10000000'));
    const zero = this.convertByteArrayToNumber(StringUtils.convertStringToByte('00000000'));
    const ldata = data | (dot ? one : zero);
    await super.sendData(address, ldata);
  }

  /**
   * Sets the display to a signed decimal number.
   * @param num The signed decimal number to set in the display.
   * @param dots Set true to turn on the dots.
   * @param leadingZeros Set true to lead the number with zeros.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToSignedDecNumber(num: number, dots: boolean, leadingZeros: boolean) {
    if (num >= 0) {
      await this.setDisplayToDecNumberAt(num, dots, 0, leadingZeros);
    } else {
      num = -num;
      if (num > 9999999) {
        await super.setDisplayToError();
      } else {
        await this.setDisplayToDecNumberAt(num, dots, 1, leadingZeros);
        const charVal = this.getCharValue('-');
        await this.sendChar(0, charVal, (dots ? 1 : 0 & 0x80) !== 0);
      }
    }
  }

  /**
   * Sets the display to a binary number.
   * @param num The binary number to set in the display.
   * @param dots Set true to turn on the dots.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToBinNumber(num: number, dots: boolean) {
    let digit = 0;
    let pos = 0;
    let ldot = false;
    const displays = this.charCount;
    for (let i = 0; i < displays; i++) {
      digit = (num & (1 << i)) === 0 ? 0 : 1;
      pos = displays - i - 1;
      ldot = (dots ? 1 : 0 & (1 << i)) !== 0;
      await super.setDisplayDigit(digit, pos, ldot);
    }
  }

  /**
   * Sets the color of the character or digit at the specified position.
   * @param color The color to set the digit/character to.
   * @param pos The position of the character to change the
   * color of.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setLed(color: TM1638LedColor, pos: number) {
    await super.sendData((pos << 1) + 1, color);
  }

  /**
   * Gets a byte representing the buttons pushed. The display has 8
   * buttons, each representing one bit in the byte.
   * @returns The push buttons.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async getPushButtons() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('TM1638');
    }

    let keys = 0;
    const strobe = this.strobePin;
    await strobe.write(PinState.HIGH);
    await super.send(0x42);
    for (let i = 0; i < 4; i++) {
      const val = await super.receive();
      keys |= val << i;
    }

    await strobe.write(PinState.LOW);
    return keys;
  }

  private convertByteArrayToNumber(byteArray: number[]) {
    const data = new Uint8Array(byteArray);
    const dataView = new DataView(data.buffer);
    return dataView.getUint8(0);
  }
}
