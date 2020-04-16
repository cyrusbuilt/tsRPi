import IComponent from '../IComponent';
import { LcdTextAlignment } from './LcdTextAligment';

/**
 * An LCD display device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface ILcd extends IComponent {
  /**
   * Gets the number of rows supported by the display.
   */
  readonly rowCount: number;

  /**
   * Gets the columns supported by the display.
   */
  readonly columnCount: number;

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
  clear(row: number, column: number, length: number): Promise<void>;

  /**
   * Positions the cursor at the specified column and
   * row. If only the row is given, then the cursor is placed at the beginning of
   * the specified row.
   * @param row The number of the row to position the cursor in.
   * @param column The number of the column in the specified row to
   * position the cursor.
   */
  setCursorPosition(row: number, column: number): Promise<void>;

  /**
   * Sends the cursor to the home position which is in
   * the top-level corner of the screen (row 0, column 0).
   */
  sendCursorHome(): Promise<void>;

  /**
   * Writes a single byte of data to the display.
   * @param data The byte to send.
   */
  writeSingleByte(data: number): Promise<void>;

  /**
   * Writes a single character to the display.
   * @param char A single character to write.
   */
  writeSingleChar(char: string): Promise<void>;

  /**
   * Write the specified byte to the display at the
   * specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param data The byte to write.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  writeByte(row: number, column: number, data: number): Promise<void>;

  /**
   * Writes the specified byte buffer to the display at
   * the specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param dataBuffer The array of bytes to write to the display.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  writeBytes(row: number, column: number, dataBuffer: number[]): Promise<void>;

  /**
   * Writes a single character to the display at the
   * specified position.
   * @param row The row to position the character in.
   * @param column The column within the row to start the write.
   * @param char The character to write.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  writeChar(row: number, column: number, char: string): Promise<void>;

  /**
   * Writes the specified character buffer to the display
   * at the specified position.
   * @param row The row to position the data in.
   * @param column The column within the row to start the write.
   * @param charBuffer The array of characters to write to the display.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid for the display.
   */
  writeChars(row: number, column: number, charBuffer: string[]): Promise<void>;

  /**
   * Writes text to the display in the specified row.
   * @param row The row to write the text in.
   * @param str The text string to write.
   * @param alignment The text alignment within the row.
   * @throws [[InvalidOperationException]] if the row index is
   * invalid for the display.
   */
  writeString(row: number, str: string, alignment: LcdTextAlignment): Promise<void>;

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
  writeLineAligned(row: number, str: string, alignment: LcdTextAlignment): Promise<void>;

  /**
   * Write the specified data to the display with the text
   * aligned to the left, then position the cursor at the beginning of the next row.
   * @param row The row to write the text in.
   * @param str The text string to write.
   * @throws [[InvalidOperationException]] if the row index is
   * invalid for the display.
   */
  writeLine(row: number, str: string): Promise<void>;
}
