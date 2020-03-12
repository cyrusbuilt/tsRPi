import * as Util from 'util';
import IDisposable from '../IDisposable';
import { PinState } from '../IO';
import ObjectDisposedException from '../ObjectDisposedException';
import Coreutils from '../PiSystem/CoreUtils';
import { DisplayEntryModes } from './DisplayEntryModes';
import { DisplayOnOffControl } from './DisplayOnOffControl';
import { FunctionSetFlags } from './FunctionSetFlags';
import ILcdTransferProvider from './ILcdTransferProvider';
import { LcdCommands } from './LcdCommands';

/**
 * @classdesc Hitachi HD44780-based LCD module control class, largely derived from:
 * Micro Liquid Crystal Library
 * http://microliquidcrystal.codeplex.com
 * Appache License Version 2.0
 * This classes uses the LcdTransferProvider to provide
 * an interface between the Raspberry Pi and the LCD module via GPIO.
 * @implements [[IDisposable]]
 */
export default class LcdModule implements IDisposable {
  private objDisposed: boolean;
  private xferProvider: ILcdTransferProvider;
  private backlight: boolean;
  private isVisible: boolean;
  private doesShowCursor: boolean;
  private doesBlinkCursor: boolean;
  private sendQueue: number[];
  private displayFunction: number;
  private numLines: number;
  private numColumns: number;
  private readonly rowOffsets: number[];

  /**
   * Initializes a new instance of the jsrpi.LCD.LcdModule class with the
   * transfer provider.
   * @param provider The transfer provider to use to send
   * data and commands to the display.
   */
  constructor(provider: ILcdTransferProvider) {
    this.xferProvider = provider;
    this.numLines = 0;
    this.numColumns = 0;
    this.objDisposed = false;
    this.rowOffsets = [0x00, 0x40, 0x14, 0x54];
    this.backlight = true;
    this.isVisible = true;
    this.doesShowCursor = true;
    this.doesBlinkCursor = true;
    this.sendQueue = [];
    this.displayFunction = 0;
    if (this.provider.isFourBitMode) {
      this.displayFunction =
        FunctionSetFlags.FOUR_BIT_MODE | FunctionSetFlags.ONE_LINE | FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
    } else {
      this.displayFunction =
        FunctionSetFlags.EIGHT_BIT_MODE | FunctionSetFlags.ONE_LINE | FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
    }
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
   * Gets the LCD transfer provider.
   * @readonly
   */
  public get provider() {
    return this.xferProvider;
  }

  /**
   * Gets the number of rows.
   * @readonly
   */
  public get rows() {
    return this.numLines;
  }

  /**
   * Gets the number of columns.
   * @readonly
   */
  public get columns() {
    return this.numColumns;
  }

  /**
   * Gets a flag indicating whether or not to show the cursor.
   * @readonly
   */
  public get showCursor() {
    return this.doesShowCursor;
  }

  /**
   * Sets a flag indicating whether or not to show the cursor.
   * @param value Set true to show the cursor.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setShowCursor(value: boolean) {
    if (this.doesShowCursor !== value) {
      this.doesShowCursor = value;
      await this.updateDisplayControl();
    }
  }

  /**
   * Gets a flag indicating whether or not the cursor should blink.
   * @readonly
   */
  public get blinkCursor() {
    return this.doesBlinkCursor;
  }

  /**
   * Sets a flag indicating whether or not the cursor should blink.
   * @param value Set true to blink cursor.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setBlinkCursor(value: boolean) {
    if (this.doesBlinkCursor !== value) {
      this.doesBlinkCursor = value;
      await this.updateDisplayControl();
    }
  }

  /**
   * Gets a flag indicating whether or not the LCD display is turned on
   * or off.
   * @readonly
   */
  public get visible() {
    return this.isVisible;
  }

  /**
   * Sets a flag indicating whether or not the LCD display is turned on
   * or off.
   * @param value Set true to turn on the display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setVisible(value: boolean) {
    if (this.isVisible !== value) {
      this.isVisible = value;
      await this.updateDisplayControl();
    }
  }

  /**
   * Gets a flag indicating whether or not the backlight is enabled.
   * @readonly
   */
  public get backlightEnabled() {
    return this.backlight;
  }

  /**
   * Sets a flag indicating whether or not the backlight is enabled.
   * @param value Set true to enable the backlight.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setBacklightEnabled(value: boolean) {
    if (this.backlight !== value) {
      this.backlight = value;
      await this.updateDisplayControl();
    }
  }

  /**
   * Sends a command to the display.
   * @param data The data or command to send.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async sendCommand(data: number) {
    await this.xferProvider.send(data, PinState.LOW, this.backlight);
  }

  /**
   * Sends on data byte to the display.
   * @param data The data to send.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async writeByte(data: number) {
    await this.xferProvider.send(data, PinState.HIGH, this.backlight);
  }

  /**
   * Creates a custom character (glyph) for use on the LCD. Up to eight
   * characters of 5x8 pixels are supported (numbered 0 - 7). The appearance of
   * each custom character is specified by an array of eight bytes, one for each
   * row. The five least significan bits of each byte determine the pixels in
   * that row. To display a custom character on the screen, call writeByte() and
   * pass its number.
   * @param location Which character to create (0 - 7).
   * @param charmap The character's pixel data.
   * @param offset Offset in the charmap where character data is found.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async createChar(location: number, charmap: number[], offset: number = 0) {
    location &= 0x07; // We only have 8 locations (0 - 7).
    await this.sendCommand(LcdCommands.SET_CG_RAM_ADDR | (location << 3));
    for (let i = 0; i < 8; i++) {
      await this.writeByte(charmap[offset + i]);
    }
  }

  /**
   * Writes a specified number of bytes to the LCD using data from a buffer.
   * @param buffer The byte array containing data to write to the display.
   * @param offset The zero-base byte offset in the buffer at which to
   * begin copying bytes.
   * @param count The number of bytes to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async write(buffer: Buffer, offset: number, count: number) {
    const len = offset + count;
    for (let i = offset; i < len; i++) {
      await this.writeByte(buffer[i]);
    }
  }

  /**
   * Writes text to the LCD.
   * @param str The text to display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async writeString(str: string) {
    const buffer = Buffer.from(str, 'utf-8');
    await this.write(buffer, 0, buffer.length);
  }

  /**
   * Moves the cursor left or right.
   * @param right Set true to move the cursor right; false to move left.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async moveCursor(right: boolean) {
    await this.sendCommand(0x10 | (right ? 0x04 : 0x00));
  }

  /**
   * Scrolls the contents of the display (text and cursor) one
   * space to the right.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async scrollDisplayRight() {
    await this.sendCommand(0x18 | 0x04);
  }

  /**
   * Scrolls the contents of the display (text and cursor) one
   * space to the left.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async scrollDisplayLeft() {
    await this.sendCommand(0x18 | 0x00);
  }

  /**
   * Position the LCD cursor; that is, set the location at which
   * subsequent text written to the LCD will be displayed.
   * @param column The column position.
   * @param row The row position.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async setCursorPosition(column: number, row: number) {
    if (row > this.rows) {
      row = this.rows - 1;
    }

    const address = column + this.rowOffsets[row];
    await this.sendCommand(LcdCommands.SET_DD_RAM_ADDR | address);
  }

  /**
   * Positions the cursor in the upper-left of the LCD (home position).
   * That is, use that location in outputting subsequent text to the
   * display. To also clear the display, use the clear()
   * method instead.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async returnHome() {
    await this.sendCommand(LcdCommands.RETURN_HOME);
    await Coreutils.sleepMicroseconds(2000);
  }

  /**
   * Clears the LCD screen and positions the cursor in the upper-left
   * corner of the display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async clear() {
    await this.sendCommand(LcdCommands.CLEAR_DISPLAY);
    await Coreutils.sleepMicroseconds(2000);
  }

  /**
   * Initializes the LCD. Specifies dimensions (width and height)
   * of the display.
   * @param columns The number of columns that the display has.
   * @param lines The number of rows the display has.
   * @param leftToRight If set to true left to right, versus right to left.
   * @param dotSize If set true and only one line set, then the
   * font size will be set 10px high.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin(columns: number, lines: number, leftToRight: boolean = true, dotSize: boolean = false) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('LcdModule');
    }

    if (lines > 1) {
      this.displayFunction |= FunctionSetFlags.TWO_LINE;
    }

    this.numLines = lines;
    this.numColumns = columns;

    // For some 1 line displays, you can select 10 pixel high font.
    if (dotSize && lines === 1) {
      this.displayFunction |= FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
    }

    // LCD controller needs time to warm-up.
    this.enqueueCommand(-1);
    await this.processSendQueue(50);

    // rs, rw, and enable should be low by default.
    if (this.provider.isFourBitMode) {
      // This is according to the Hitachi HD44780 datasheet.
      // figure 24, pg 46.

      // We start in 8-bit mode, try to set to 4-bit mode.
      await this.sendCommand(0x03);
      this.enqueueCommand(0x03); // Wait minimum 4.1ms
      this.enqueueCommand(0x03);
      this.enqueueCommand(0x02); // Finally, set to 4-bit interface.
      await this.processSendQueue(5);
    } else {
      // This is according to the Hitachi HD44780 datasheet
      // page 45, figure 23.

      // Send function set command sequence.
      await this.sendCommand(LcdCommands.FUNCTION_SET | this.displayFunction);
      this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction);
      this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction);
      await this.processSendQueue(5);
    }

    // Finally, set # of lines, font size, etc.
    this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction);
    await this.processSendQueue(0);

    // Turn the display on with no cursor or blinking default.
    this.isVisible = true;
    this.doesShowCursor = false;
    this.doesBlinkCursor = false;
    this.backlight = true;
    await this.updateDisplayControl();

    // Clear it off.
    await this.clear();

    // Set the entry mode.
    let displayMode = leftToRight ? DisplayEntryModes.ENTRY_LEFT : DisplayEntryModes.ENTRY_RIGHT;
    displayMode |= DisplayEntryModes.ENTRY_SHIFT_DECREMENT;
    await this.sendCommand(LcdCommands.ENTRY_MODE_SET | displayMode);
  }

  /**
   * Releases all managed resources used by this instance.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.provider.dispose();
    this.sendQueue = [];
    this.isVisible = false;
    this.doesBlinkCursor = false;
    this.numColumns = 0;
    this.numLines = 0;
    this.objDisposed = true;
  }

  private async updateDisplayControl() {
    let command = LcdCommands.DISPLAY_CONTROL;
    command |= this.isVisible ? DisplayOnOffControl.DISPLAY_ON : DisplayOnOffControl.DISPLAY_OFF;
    command |= this.doesShowCursor ? DisplayOnOffControl.CURSOR_ON : DisplayOnOffControl.CURSOR_OFF;
    command |= this.doesBlinkCursor ? DisplayOnOffControl.BLINK_ON : DisplayOnOffControl.BLINK_OFF;

    // NOTE: Backlight is updated with each command.
    return this.sendCommand(command);
  }

  private async processSendQueue(timeout: number) {
    if (this.sendQueue.length === 0) {
      return;
    }

    // this.ready = true;
    if (timeout < 0) {
      timeout = 0;
    }

    const cmd = this.sendQueue.shift();
    if (!Util.isNullOrUndefined(cmd) && cmd !== -1) {
      await this.sendCommand(cmd);
      await Coreutils.delay(timeout);
    }

    if (this.sendQueue.length > 0) {
      await this.processSendQueue(timeout);
    }
  }

  private enqueueCommand(cmd: number) {
    this.sendQueue.push(cmd);
  }
}
