import IDisposable from '../../IDisposable';

/**
 *
 * @extends [[IDisposable]]
 */
export default interface II2C extends IDisposable {
  /**
   * Gets whether or not the bus connection is open.
   * @returns true if open; Otherwise, false.
   * @readonly
   */
  isOpen: boolean;

  /**
   * Opens the I2C bus connection.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if the bus connection could not be opened.
   */
  open(): Promise<void>;

  /**
   * Closes the I2C bus connection.
   */
  close(): Promise<void>;

  /**
   * Writes a single byte to the specified device address.
   * @param address The device address.
   * @param byte The byte value to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IOException]] if unable to write to the bus.
   */
  writeByte(address: number, byte: number): Promise<void>;

  /**
   * Writes a buffer of bytes to the specified device address. Currenly,
   * RPi drivers do not allow writing more than 3 bytes at a time. As such,
   * if a buffer of greater than 3 bytes is provided, an exception is thrown.
   * @param address The device address.
   * @param buffer The buffer containing the bytes to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IllegalArgumentException]] if the supplied buffer contains
   * more than 3 bytes.
   * @throws [[IOException]] if unable to write to the bus.
   */
  writeBytes(address: number, buffer: Buffer): Promise<void>;

  /**
   * Writes a command with data to the specified device address.
   * @param address The address of the target device.
   * @param command The command to send to the device.
   * @param data1 The data to send as the first parameter. (Optional)
   * @param data2 The data to send as the second parameter. (Optional)
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IOException]] if unable to write to the bus.
   */
  writeCommand(address: number, command: number, data1?: number, data2?: number): Promise<void>;

  /**
   * Writes a command with data to the specified device address.
   * @param address The address of the target device.
   * @param command The command to send to the device.
   * @param data The data to send with the command.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IOException]] if unable to write to the bus.
   */
  writeCommandByte(address: number, command: number, data: number): Promise<void>;

  /**
   * Reads bytes from the device at the specified address.
   * @param address The address of the device to read from.
   * @param count The number of bytes to read.
   * @returns A [[Buffer]] containing the bytes read.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection to
   * read from.
   * @throws [[IOException]] if an I/O error occurred, the specified address
   * is inaccessible, or the I2C transaction failed.
   */
  readBytes(address: number, count: number): Promise<Buffer>;

  /**
   * Reads a single byte from the device at the specified address. The
   * address of the device to read from.
   * @param address The address of the device to read from.
   * @returns The byte read.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection to
   * read from.
   * @throws [[IOException]] if an I/O error occurred, the specified address
   * is inaccessible, or the I2C transaction failed.
   */
  read(address: number): Promise<number>;
}
