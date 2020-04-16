import IllegalArgumentException from '../../IllegalArgumentException';
import InvalidOperationException from '../../InvalidOperationException';
import ComponentBase from '../ComponentBase';
import ILcd from './ILcd';
import { LcdTextAlignment } from './LcdTextAligment';

/**
 * Base class for LCD display abstractions.
 * @extends [[ComponentBase]]
 * @implements [[ILcd]]
 */
export default abstract class LcdBase extends ComponentBase implements ILcd {
  /**
   * Gets the number of rows supported by the display.
   * @readonly
   * @override
   */
  public get rowCount() {
    return this.rows;
  }

  /**
   * Gets the columns supported by the display.
   * @readonly
   * @override
   */
  public get columnCount() {
    return this.columns;
  }

  private rows: number;
  private columns: number;

  /**
   * Initializes a new instance of the [[LcdBase]] class.
   * @param rows The number of rows the display supports.
   * @param columns The number of columns display supports.
   * @constructor
   */
  constructor(rows: number, columns: number) {
    super();
    this.rows = rows;
    this.columns = columns;
  }

  /**
   * Releases managed resources used by this instance.
   * @override
   */
  public dispose() {
    if (this.isDisposed) {
      return;
    }

    this.rows = 0;
    this.columns = 0;
    super.dispose();
  }

  /**
   * Positions the cursor at the specified column and
   * row. If only the row is given, then the cursor is placed at the beginning of
   * the specified row.
   * @param row The number of the row to position the cursor in.
   * @param column The number of the column in the specified row to
   * position the cursor.
   * @override
   */
  public abstract setCursorPosition(row: number, column: number): Promise<void>;

  /**
   * Sends the cursor to the home position which is in the top-level corner of
   * the screen (row 0, column 0).
   * @override
   */
  public async sendCursorHome() {
    await this.setCursorPosition(0, 0);
  }

  /**
   * Writes a single byte of data to the display.
   * @param data The byte to send.
   * @override
   */
  public abstract writeSingleByte(data: number): Promise<void>;

  /**
   * Writes a single character to the display.
   * @param char A single character to write.
   * @throws [[IllegalArgumentException]] if the specificed string is more
   * than one character in length.
   * @override
   */
  public async writeSingleChar(char: string) {
    if (char.length > 1) {
      throw new IllegalArgumentException('For a single char, string length cannot be greater than 1.');
    }

    await this.writeSingleByte(char.charCodeAt(0));
  }

  /**
   * Write the specified byte to the display at the
   * specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param data The byte to write.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   * @override
   */
  public async writeByte(row: number, column: number, data: number) {
    this.validateCoordinates(row, column);
    await this.setCursorPosition(row, column);
    await this.writeSingleByte(data);
  }

  /**
   * Writes the specified byte buffer to the display at
   * the specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param dataBuffer The array of bytes to write to the display.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   * @override
   */
  public async writeBytes(row: number, column: number, dataBuffer: number[]) {
    this.validateCoordinates(row, column);
    await this.setCursorPosition(row, column);
    for (const byte of dataBuffer) {
      await this.writeSingleByte(byte);
    }
  }

  /**
   * Writes a single character to the display at the
   * specified position.
   * @param row The row to position the character in.
   * @param column The column within the row to start the write.
   * @param char The character to write.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   * @override
   */
  public async writeChar(row: number, column: number, char: string) {
    this.validateCoordinates(row, column);
    await this.setCursorPosition(row, column);
    await this.writeSingleChar(char);
  }

  /**
   * Writes the specified character buffer to the display
   * at the specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param charBuffer The array of characters to write to the display.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   * @override
   */
  public async writeChars(row: number, column: number, charBuffer: string[]) {
    this.validateCoordinates(row, column);
    await this.setCursorPosition(row, column);
    for (const char of charBuffer) {
      await this.writeSingleChar(char);
    }
  }

  /**
   * Writes text to the display in the specified row.
   * @param row The row to write the text in.
   * @param str The text string to write.
   * @param alignment The text alignment within the row.
   * @throws [[InvalidOperationException]] if the row index is
   * invalid for the display.
   */
  public async writeString(row: number, str: string, alignment: LcdTextAlignment) {
    // Compute column index.
    let columnIndex = 0;
    if (alignment !== LcdTextAlignment.LEFT && str.length < this.columnCount) {
      const remaining = this.columnCount - str.length;
      if (alignment === LcdTextAlignment.RIGHT) {
        columnIndex = remaining;
      }

      if (alignment === LcdTextAlignment.CENTER) {
        columnIndex = remaining / 2;
      }
    }

    // validate and set cursor pos.
    this.validateCoordinates(row, columnIndex);
    await this.setCursorPosition(row, columnIndex);

    // Write out each character of the string.
    const chars = str.split('');
    for (const char of chars) {
      await this.writeSingleChar(char);
    }
  }

  /**
   * Write the specified string to the display, aligned
   * using the specified alignment, then positions the cursor at the beginning of
   * the next row.
   * @param row The row to write the text in.
   * @param str The text string to write.
   * @param alignment The text alignment within the row.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  public async writeLineAligned(row: number, str: string, alignment: LcdTextAlignment) {
    await this.writeString(row, str, alignment);
    await this.setCursorPosition(row++, 0);
  }

  /**
   * Write the specified data to the display with the text
   * aligned to the left, then position the cursor at the beginning of the next row.
   * @param row The row to write the text in.
   * @param str The text string to write.
   * @throws [[InvalidOperationException]] if the row index is
   * invalid for the display.
   */
  public async writeLine(row: number, str: string) {
    await this.writeLineAligned(row, str, LcdTextAlignment.LEFT);
  }

  /**
   * clear one or more characters starting at the
   * specified row and column. Can also be used to clear an entire row or the
   * entire display. If only the row is specified, then just that row will be
   * cleared. If no parameters are given, then the whole display is cleared.
   * @param row The number of the row (zero-based) to clear the
   * character(s) from.
   * @param column The column (zero-based) that is the starting position.
   * @param length The number of characters to clear. If zero or not
   * specified, then assumes remainder of row.
   */
  public async clear(row: number, column: number, length: number) {
    if (length > this.columnCount) {
      length = this.columnCount;
    }

    let sb = '';
    for (let i = row; i < length; i++) {
      sb += '';
    }

    this.validateCoordinates(row, column);
    for (let j = row; j < this.rowCount; j++) {
      await this.writeString(j, sb, LcdTextAlignment.LEFT);
    }
  }

  /**
   * Validates the index of the specified row.
   * @param row The index of the row to validate.
   * @throws [[InvalidOperationException]] if the row index is invalid for
   * the display.
   */
  protected validateRowIndex(row: number) {
    if (row >= this.rowCount || row < 0) {
      throw new InvalidOperationException('Invalid row index.');
    }
  }

  /**
   * Validates the index of the column.
   * @param column The index of the column to validate.
   * @throws [[InvalidOperationException]] if the column index is invalid for
   * the display.
   */
  protected validColumnIndex(column: number) {
    if (column >= this.columnCount || column < 0) {
      throw new InvalidOperationException('Invalid column index.');
    }
  }

  /**
   * Validates the specified coordinates.
   * @param row The index of the row to validate.
   * @param column The index of the column to validate.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  protected validateCoordinates(row: number, column: number) {
    this.validateRowIndex(row);
    this.validColumnIndex(column);
  }
}
