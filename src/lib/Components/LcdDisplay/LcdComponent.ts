import ILcdTransferProvider from '../../LCD/ILcdTransferProvider';
import LcdModule from '../../LCD/LcdModule';
import LcdBase from './LcdBase';

/**
 * @classdesc An LCD display device abstraction component.
 * @extends [[LcdBase]]
 */
export default class LcdComponent extends LcdBase {
  private module: LcdModule;

  /**
   * Initializes a new instance of the jsrpi.Components.LcdDisplay.LcdComponent
   * class with the transfer provider and number of rows and columns.
   * @param provider The LCD transfer provider.
   * @param rows The number of rows in the display.
   * @param columns The number of columns.
   * @constructor
   */
  constructor(provider: ILcdTransferProvider, rows: number, columns: number) {
    super(rows, columns);
    this.module = new LcdModule(provider);
  }

  /**
   * Initializes the LCD component.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    await this.module.begin(this.columnCount, this.rowCount, true, false);
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    await this.module.dispose();
    super.dispose();
  }

  /**
   * Positions the cursor at the specified column and
   * row. If only the row is given, then the cursor is placed at the beginning of
   * the specified row.
   * @param row The number of the row to position the cursor in.
   * @param column The number of the column in the specified row to
   * position the cursor.
   * @throws [[InvalidOperationException]] if the row or column index is
   * invalid.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async setCursorPosition(row: number, column: number) {
    this.validateCoordinates(row, column);
    await this.module.setCursorPosition(row, column);
  }

  /**
   * Writes a single byte of data to the display.
   * @param data The byte to send.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async writeSingleByte(data: number) {
    await this.module.writeByte(data);
  }

  /**
   * Clears the display.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async clearDisplay() {
    await this.module.clear();
  }

  /**
   * Sends the cursor to the home position which is in the top-level corner of
   * the screen (row 0, column 0).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async sendCursorHome() {
    await this.module.returnHome();
  }

  /**
   * Converts this instance to string by returning either the component name
   * or an empty string.
   * @override
   */
  public toString() {
    return this.componentName || '';
  }
}
