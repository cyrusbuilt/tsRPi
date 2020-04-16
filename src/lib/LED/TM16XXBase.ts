import IDisposable from '../IDisposable';
import IRaspiGpio from '../IO/IRaspiGpio';
import { PinState } from '../IO/PinState';
import ObjectDisposedException from '../ObjectDisposedException';
import StringUtils from '../StringUtils';

/**
 * The character map for the seven segment displays.
 * The bits are displayed by mapping below:
 *  -- 0 --
 * |       |
 * 5       1
 *  -- 6 --
 * 4       2
 * |       |
 *  -- 3 --  .7
 */
const C_MAP: Map<string, number[]> = new Map([
  [' ', StringUtils.convertStringToByte('00000000')],
  ['!', StringUtils.convertStringToByte('10000110')],
  ['"', StringUtils.convertStringToByte('00100010')],
  ['#', StringUtils.convertStringToByte('01111110')],
  ['$', StringUtils.convertStringToByte('01101101')],
  ['%', StringUtils.convertStringToByte('00000000')],
  ['&', StringUtils.convertStringToByte('00000000')],
  ["'", StringUtils.convertStringToByte('00000010')],
  ['(', StringUtils.convertStringToByte('00110000')],
  [')', StringUtils.convertStringToByte('00000110')],
  ['*', StringUtils.convertStringToByte('01100011')],
  ['+', StringUtils.convertStringToByte('00000000')],
  [',', StringUtils.convertStringToByte('00000100')],
  ['-', StringUtils.convertStringToByte('01000000')],
  ['.', StringUtils.convertStringToByte('10000000')],
  ['/', StringUtils.convertStringToByte('01010010')],
  ['0', StringUtils.convertStringToByte('00111111')],
  ['1', StringUtils.convertStringToByte('00000110')],
  ['2', StringUtils.convertStringToByte('01011011')],
  ['3', StringUtils.convertStringToByte('01001111')],
  ['4', StringUtils.convertStringToByte('01100110')],
  ['5', StringUtils.convertStringToByte('01101101')],
  ['6', StringUtils.convertStringToByte('01111101')],
  ['7', StringUtils.convertStringToByte('00100111')],
  ['8', StringUtils.convertStringToByte('01111111')],
  ['9', StringUtils.convertStringToByte('01101111')],
  [':', StringUtils.convertStringToByte('00000000')],
  [';', StringUtils.convertStringToByte('00000000')],
  ['<', StringUtils.convertStringToByte('00000000')],
  ['=', StringUtils.convertStringToByte('01001000')],
  ['>', StringUtils.convertStringToByte('00000000')],
  ['?', StringUtils.convertStringToByte('01010011')],
  ['@', StringUtils.convertStringToByte('01011111')],
  ['A', StringUtils.convertStringToByte('01110111')],
  ['B', StringUtils.convertStringToByte('01111111')],
  ['C', StringUtils.convertStringToByte('00111001')],
  ['D', StringUtils.convertStringToByte('00111111')],
  ['E', StringUtils.convertStringToByte('01111001')],
  ['F', StringUtils.convertStringToByte('01110001')],
  ['G', StringUtils.convertStringToByte('00111101')],
  ['H', StringUtils.convertStringToByte('01110110')],
  ['I', StringUtils.convertStringToByte('00000110')],
  ['J', StringUtils.convertStringToByte('00011111')],
  ['K', StringUtils.convertStringToByte('01101001')],
  ['L', StringUtils.convertStringToByte('00111000')],
  ['M', StringUtils.convertStringToByte('00010101')],
  ['N', StringUtils.convertStringToByte('00110111')],
  ['O', StringUtils.convertStringToByte('00111111')],
  ['P', StringUtils.convertStringToByte('01110011')],
  ['Q', StringUtils.convertStringToByte('01100111')],
  ['R', StringUtils.convertStringToByte('00110001')],
  ['S', StringUtils.convertStringToByte('01101101')],
  ['T', StringUtils.convertStringToByte('01111000')],
  ['U', StringUtils.convertStringToByte('00111110')],
  ['V', StringUtils.convertStringToByte('00101010')],
  ['W', StringUtils.convertStringToByte('00011101')],
  ['X', StringUtils.convertStringToByte('01110110')],
  ['Y', StringUtils.convertStringToByte('01101110')],
  ['Z', StringUtils.convertStringToByte('01011011')],
  ['[', StringUtils.convertStringToByte('00111001')],
  ['\\', StringUtils.convertStringToByte('01100100')],
  [']', StringUtils.convertStringToByte('00001111')],
  ['^', StringUtils.convertStringToByte('00000000')],
  ['_', StringUtils.convertStringToByte('00001000')],
  ['`', StringUtils.convertStringToByte('00100000')],
  ['a', StringUtils.convertStringToByte('01011111')],
  ['b', StringUtils.convertStringToByte('01111100')],
  ['c', StringUtils.convertStringToByte('01011000')],
  ['d', StringUtils.convertStringToByte('01011110')],
  ['e', StringUtils.convertStringToByte('01111011')],
  ['f', StringUtils.convertStringToByte('00110001')],
  ['g', StringUtils.convertStringToByte('01101111')],
  ['h', StringUtils.convertStringToByte('01110100')],
  ['i', StringUtils.convertStringToByte('00000100')],
  ['j', StringUtils.convertStringToByte('00001110')],
  ['k', StringUtils.convertStringToByte('01110101')],
  ['l', StringUtils.convertStringToByte('00110000')],
  ['m', StringUtils.convertStringToByte('01010101')],
  ['n', StringUtils.convertStringToByte('01010100')],
  ['o', StringUtils.convertStringToByte('01011100')],
  ['p', StringUtils.convertStringToByte('01110011')],
  ['q', StringUtils.convertStringToByte('01100111')],
  ['r', StringUtils.convertStringToByte('01010000')],
  ['s', StringUtils.convertStringToByte('01101101')],
  ['t', StringUtils.convertStringToByte('01111000')],
  ['u', StringUtils.convertStringToByte('00011100')],
  ['v', StringUtils.convertStringToByte('00101010')],
  ['w', StringUtils.convertStringToByte('00011101')],
  ['x', StringUtils.convertStringToByte('01110110')],
  ['y', StringUtils.convertStringToByte('01101110')],
  ['z', StringUtils.convertStringToByte('01000111')],
  ['{', StringUtils.convertStringToByte('01000110')],
  ['|', StringUtils.convertStringToByte('00000110')],
  ['}', StringUtils.convertStringToByte('01110000')],
  ['~', StringUtils.convertStringToByte('00000001')],
]);

/**
 * @classdesc This class is the base class for the TM1638/TM1640 board.
 * It is a port of the TM1638 library by Ricardo Batista.
 * @URL http://code.google.com/p/tm1638-library/
 * @abstract
 * @implements [[IDisposable]]
 */
export default abstract class TM16XXBase implements IDisposable {
  /**
   * The character map.
   */
  public static readonly CHAR_MAP = C_MAP;

  protected dataPin: IRaspiGpio;
  protected clockPin: IRaspiGpio;
  protected strobePin: IRaspiGpio;
  protected charCount: number;

  private active: boolean;
  private objDisposed: boolean;
  private shouldActivate: boolean;
  private brightness: number;

  /**
   * Initializes a new instance of the [[TM16XXBase]] class with the data,
   * clock, and strobe pins, the number of characters to displayer, whether
   * or not the display should be activated on init, and the brightness level.
   * @param data The data pin.
   * @param clock The clock pin.
   * @param strobe The strobe pin.
   * @param intensity The display intensity (brightness) level.
   * @param displays The number of characters to display.
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
    this.objDisposed = false;
    this.dataPin = data;
    this.clockPin = clock;
    this.strobePin = strobe;

    // TODO what is the acceptable range?
    this.charCount = displays;

    this.shouldActivate = activate;
    this.brightness = intensity;
    this.active = false;
  }

  /**
   * Determines whether or not the current instance has been disposed.
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.objDisposed;
  }

  /**
   * Gets a value indicating whether or not the display is active.
   * @readonly
   * @override
   */
  public get isActive() {
    return this.active;
  }

  /**
   * Send the specified data to the display.
   * @param data The byte of data to send.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async send(data: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('TM16XXBase');
    }

    for (let i = 0; i < 8; i++) {
      await this.clockPin.write(PinState.LOW);
      await this.dataPin.write((data & 1) > 0 ? PinState.HIGH : PinState.LOW);
      data >>= 1;
      await this.clockPin.write(PinState.HIGH);
    }
  }

  /**
   * Sends the command.
   * @param cmd A byte representing the command.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async sendCommand(cmd: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('TM16XXBase');
    }

    await this.strobePin.write(PinState.LOW);
    await this.send(cmd);
    await this.strobePin.write(PinState.HIGH);
  }

  /**
   * Initializes the display. This method MUST be called before doing anything
   * else with the display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('TM16XXBase');
    }

    await this.dataPin.provision();
    await this.clockPin.provision();
    await this.strobePin.provision();
    await this.strobePin.write(PinState.HIGH);
    await this.clockPin.write(PinState.HIGH);

    // TODO What is the acceptable range of "intensity"?
    await this.sendCommand(0x40);
    await this.sendCommand(0x80 | (this.shouldActivate ? 0x08 : 0x00) | Math.min(7, this.brightness));

    await this.strobePin.write(PinState.LOW);
    await this.send(0xc0);
    for (let i = 0; i < 16; i++) {
      await this.send(0x00);
    }

    await this.strobePin.write(PinState.LOW);
  }

  /**
   * Receives data from the display driver.
   * @returns The byte received.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async receive() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('TM16XXBase');
    }

    // pull-up on.
    let temp = 0;
    await this.dataPin.write(PinState.HIGH);
    for (let i = 0; i < 8; i++) {
      temp >>= 1;
      await this.clockPin.write(PinState.LOW);
      const val = await this.dataPin.read();
      if (val === PinState.HIGH) {
        temp |= 0x80;
      }

      await this.clockPin.write(PinState.HIGH);
    }

    await this.dataPin.write(PinState.LOW);
    return temp;
  }

  /**
   * Sends the specified data to the device.
   * @param address The address to write the data at.
   * @param data The data to send.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async sendData(address: number, data: number) {
    await this.sendCommand(0x44);
    await this.strobePin.write(PinState.LOW);
    await this.send(0xc0 | address);
    await this.send(data);
    await this.strobePin.write(PinState.HIGH);
  }

  /**
   * Clears the display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async clearDisplay() {
    for (let i = 0; i < this.charCount; i++) {
      await this.sendData(i << 1, 0);
    }
  }

  /**
   * In a derived class, sends the specified character to the display.
   * @param pos The position to set the character at.
   * @param data The character data to send.
   * @param dot Set true to enable the dot.
   */
  public abstract sendChar(pos: number, data: number, dot: boolean): Promise<void>;

  /**
   * Sets the display to the specified string.
   * @param str The string to set the display to.
   * @param dots Set true to turn on dots.
   * @param pos The character position to start the string at.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToString(str: string | null, dots: boolean = false, pos: number = 0) {
    if (StringUtils.isNullOrEmpty(str)) {
      await this.clearDisplay();
      return;
    }

    const val = str || '';

    let lpos = 0;
    let ldata = 0;
    let ldot = false;
    const len = val.length;
    for (let i = 0; i < this.charCount; i++) {
      if (i < len) {
        lpos = i + pos;
        const char = val.charAt(i);
        ldata = this.getCharValue(char);
        ldot = (dots ? 1 : 0 & (1 << (this.charCount - i - 1))) !== 0;
        await this.sendChar(lpos, ldata, ldot);
      } else {
        break;
      }
    }
  }

  /**
   * Sets the display to the specified values.
   * @param values The values to set to the display (byte array).
   * @param size The number of values in the specified array
   * (starting at 0) to use. Just specify <values array>.length to use the
   * whole buffer.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplay(values: number[], size: number) {
    for (let i = 0; i < size; i++) {
      await this.sendChar(i, values[i], false);
    }
  }

  /**
   * Clears the display digit.
   * @param pos The position to start clearing the display at.
   * @param dot Set true to clear dots.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async clearDisplayDigit(pos: number, dot: boolean) {
    await this.sendChar(pos, 0, dot);
  }

  /**
   * Sets the display to error.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayToError() {
    const capE = this.getCharValue('E');
    const lowR = this.getCharValue('r');
    const lowO = this.getCharValue('o');
    const err = [capE, lowR, lowR, lowO, lowR];

    await this.setDisplay(err, 5);
    for (let i = 0; i < this.charCount; i++) {
      await this.clearDisplayDigit(i, false);
    }
  }

  /**
   * Sets the specified digit in the display.
   * @param digit The digit to set.
   * @param pos The position to set the digit at.
   * @param dot Set true to turn on the dot.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setDisplayDigit(digit: number, pos: number, dot: boolean) {
    const chr = digit.toString().split('')[0];
    const theChar = this.getCharValue(chr);
    if (theChar) {
      await this.sendChar(pos, theChar, dot);
    }
  }

  /**
   * Sets up the display.
   * @param active Set true to activate.
   * @param intensity The display intensity level (brightness).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setupDisplay(active: boolean, intensity: number) {
    await this.sendCommand(0x80 | (active ? 8 : 0) | Math.min(7, intensity));
    this.active = active;

    // Necessary for the TM1640.
    await this.strobePin.write(PinState.LOW);
    await this.clockPin.write(PinState.LOW);
    await this.clockPin.write(PinState.HIGH);
    await this.strobePin.write(PinState.HIGH);
  }

  /**
   * Activates or deactivates the display.
   * @param active Set true to activate; false to deactivate.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async activateDisplay(active: boolean = true) {
    if (active) {
      if (!this.isActive) {
        await this.sendCommand(0x80);
        this.active = true;
      }
    } else {
      if (this.isActive) {
        await this.sendCommand(0x80);
        this.active = false;
      }
    }
  }

  /**
   * Releases all managed resources used by this instance.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.activateDisplay(false);

    await this.clockPin.dispose();
    await this.dataPin.dispose();
    await this.strobePin.dispose();

    this.objDisposed = true;
  }

  protected getCharValue(char: string) {
    const val = C_MAP.get(char);
    if (val) {
      const data = new Uint8Array(val);
      const dataView = new DataView(data.buffer);
      return dataView.getUint8(0);
    }

    return 0;
  }
}
