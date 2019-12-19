import IDisposable from '../../IDisposable';
import { BaudRates } from './BaudRates';

/**
 * An interface that represents the RS-232 Serial port on the Raspberry Pi.
 * IMPORTANT: You MUST explicitly call close() or dispose() when done with
 * the port in order to release it. Even if the object instance is GC'ed,
 * the port will NOT automatically be closed and therefore will remain
 * locked even after program execution ends.
 * @extends [[IDisposable]]
 */
export default interface IRs232SerialPort extends IDisposable {
  /**
   * Gets whether or not the port is open.
   * @returns true if the port is open; Otherwise, false.
   * @property
   * @readonly
   */
  isOpen: boolean;

  /**
   * Gets or sets the device path.
   * @property
   * @throws [[InvalidOperationException]] if attempting to change the device
   * path when the port is already open.
   */
  device: string;

  /**
   * Gets or sets the BAUD rate.
   * @property
   * @throws [[InvalidOperationException]] if changing the BAUD rate when the
   * port is already open.
   */
  baud: BaudRates;

  /**
   * Opens the serial port. This MUST be called before calling any other
   * I/O methods.
   * @param device The device path (if overriding the current path).
   * @param baud The BAUD rate (if overriding the current rate).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an error occurred while trying to open the
   * port.
   */
  open(device?: string, baud?: BaudRates): Promise<void>;

  /**
   * Flushes any data in the read or write buffers. This will force any data
   * in the buffers to be read or written that have not yet been.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an error occurs trying to flush the data.
   */
  flush(): Promise<void>;

  /**
   * Closes the port (if open). This will also flush the read/write buffer
   * contents before closing.
   * @throws [[IOException]] if an error occurs while trying to close the port.
   */
  close(): Promise<void>;

  /**
   * Writes a single byte value to the port.
   * @param byte The value to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   */
  write(byte: number): Promise<void>;

  /**
   * Writes a single character to the port.
   * @param char The character to write.
   * @throws [[IllegalArgumentException]] if the provided value is more than
   * one character.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   */
  putChar(c: string): Promise<void>;

  /**
   * Writes a string to the port.
   * @param data The string to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   */
  putString(s: string): Promise<void>;

  /**
   * Gets the number of available bytes in the receive buffer.
   * @returns The number of bytes in the receive buffer waiting to be read.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   */
  getBytesAvailable(): number;

  /**
   * Gets a single character from the port.
   * @returns The value read or null if no data received.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while trying to read from
   * the port.
   */
  getCharacter(): Promise<string | null>;
}
