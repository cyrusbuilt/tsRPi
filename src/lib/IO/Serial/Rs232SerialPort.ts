import SerialPort, { OpenOptions } from 'serialport';
import * as Util from 'util';
import IllegalArgumentException from '../../IllegalArgumentException';
import InvalidOperationException from '../../InvalidOperationException';
import ObjectDisposedException from '../../ObjectDisposedException';
import IOException from '../IOException';
import { BaudRates } from './BaudRates';
import IRs232SerialPort from './IRs232SerialPort';

// TODO Implment events

/**
 * @classdesc Provides access to the RS232 UARTs (serial port) on the Raspberry Pi.
 * IMPORTANT: You MUST explicitly call close() or dispose() when done with
 * the port in order to release it. Even if the object instance is GC'ed,
 * the port will NOT automatically be closed and therefore will remain
 * locked even after program execution ends.
 * @implements [[IRs232SerialPort]]
 */
export default class Rs232SerialPort implements IRs232SerialPort {
  private mDevice: string;
  private mBaud: BaudRates;
  private mIsDisposed: boolean;
  private mPort?: SerialPort;

  /**
   * Initializes a new instance of Rs232SerialPort, optionally with the
   * device path and baud rate.
   * @param device The path to the device (default is /dev/ttyAMA0).
   * @param baud The BAUD rate (default is [[BaudRates.BAUD9600]]).
   * @constructor
   */
  constructor(device?: string, baud?: BaudRates) {
    this.mDevice = device || '/dev/ttyAMA0';
    this.mBaud = baud || BaudRates.BAUD9600;
    this.mIsDisposed = false;
    this.mPort = undefined;
  }

  /**
   * Gets whether or not this instance has been disposed.
   * @returns true if disposed; Otherwise, false.
   * @property
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.mIsDisposed;
  }

  /**
   * Gets whether or not the port is open.
   * @returns true if the port is open; Otherwise, false.
   * @property
   * @readonly
   * @override
   */
  public get isOpen() {
    if (!!this.mPort) {
      return this.mPort.isOpen;
    }

    return false;
  }

  /**
   * Gets or sets the device path.
   * @property
   * @throws [[InvalidOperationException]] if attempting to change the device
   * path when the port is already open.
   * @override
   */
  public get device() {
    return this.mDevice;
  }

  public set device(value: string) {
    if (this.isOpen && this.mDevice !== value) {
      throw new InvalidOperationException('You must close the current port before changing devices.');
    }

    this.mDevice = value;
  }

  /**
   * Gets or sets the BAUD rate.
   * @property
   * @throws [[InvalidOperationException]] if changing the BAUD rate when the
   * port is already open.
   * @override
   */
  public get baud() {
    return this.mBaud;
  }

  public set baud(value: BaudRates) {
    if (this.isOpen && this.mBaud !== value) {
      throw new InvalidOperationException('You must close the current port before changing BAUD rates.');
    }

    this.mBaud = value;
  }

  /**
   * Opens the serial port. This MUST be called before calling any other
   * I/O methods.
   * @param device The device path (if overriding the current path).
   * @param baud The BAUD rate (if overriding the current rate).
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an error occurred while trying to open the
   * port.
   * @override
   */
  public async open(device?: string, baud?: BaudRates) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('Rs232SerialPort');
    }

    if (this.isOpen) {
      return;
    }

    this.mDevice = device || '/dev/ttyAMA0';
    this.mBaud = baud || BaudRates.BAUD9600;

    const opts = {
      autoOpen: false,
      baudRate: this.mBaud,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
    } as OpenOptions;

    try {
      this.mPort = new SerialPort(this.mDevice, opts);
      const asyncOpen = Util.promisify(this.mPort.open).bind(this.mPort);
      await asyncOpen();
    } catch (e) {
      let msg = `Error opening port at ${this.mDevice}`;
      if (e && e.message) {
        msg = `${msg}: ${e.message}`;
      }

      throw new IOException(msg);
    }
  }

  /**
   * Flushes any data in the read or write buffers. This will force any data
   * in the buffers to be read or written that have not yet been.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if an error occurs trying to flush the data.
   * @override
   */
  public async flush() {
    if (this.isDisposed || !!!this.mPort) {
      throw new ObjectDisposedException('Rs232SerialPort');
    }

    if (!this.isOpen) {
      return;
    }

    try {
      const asyncFlush = Util.promisify(this.mPort.flush).bind(this.mPort);
      await asyncFlush();
    } catch (e) {
      let msg = `Error flushing data to port at ${this.mDevice}`;
      if (e && e.message) {
        msg = `${msg}: ${e.message}`;
      }

      throw new IOException(msg);
    }
  }

  /**
   * Closes the port (if open). This will also flush the read/write buffer
   * contents before closing.
   * @throws [[IOException]] if an error occurs while trying to close the port.
   * @override
   */
  public async close() {
    if (!this.isOpen || !!!this.mPort) {
      return;
    }

    await this.flush();

    try {
      const asyncClose = Util.promisify(this.mPort.close).bind(this.mPort);
      await asyncClose();
    } catch (e) {
      let msg = `Error closing port at ${this.mDevice}`;
      if (e && e.message) {
        msg = `${msg}: ${e.message}`;
      }

      throw new IOException(msg);
    }
  }

  /**
   * Closes the port and releases any managed resources.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    if (this.isOpen) {
      try {
        await this.close();
      } catch (e) {
        // NEVER throw exceptions from dipose(). Log it out instead.
        console.warn(e.message);
      }
    }

    this.mPort = undefined;
    this.mIsDisposed = true;
  }

  /**
   * Writes a single byte value to the port.
   * @param byte The value to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   * @override
   */
  public async write(byte: number) {
    const bytes = new Array<number>(1);
    bytes[0] = byte;

    return this.internalWrite(Buffer.from(bytes));
  }

  /**
   * Writes a single character to the port.
   * @param char The character to write.
   * @throws [[IllegalArgumentException]] if the provided value is more than
   * one character.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   * @override
   */
  public async putChar(char: string) {
    if (char.length > 1) {
      throw new IllegalArgumentException('param char can only be a single character use putString() for multiple.');
    }

    return this.internalWrite(Buffer.from(char));
  }

  /**
   * Writes a string to the port.
   * @param data The string to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while writing to the port.
   */
  public async putString(data: string) {
    return this.internalWrite(Buffer.from(data));
  }

  /**
   * Gets the number of available bytes in the receive buffer.
   * @returns The number of bytes in the receive buffer waiting to be read.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @override
   */
  public getBytesAvailable() {
    if (this.isDisposed || !!!this.mPort) {
      throw new ObjectDisposedException('Rs232SerialPort');
    }

    if (!this.isOpen) {
      throw new InvalidOperationException(`Port not open at ${this.mDevice}`);
    }

    return this.mPort.readableLength;
  }

  /**
   * Gets a single character from the port.
   * @returns The value read or null if no data received.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if attempting to write to a port
   * that has not yet been opened.
   * @throws [[IOException]] if an error occurred while trying to read from
   * the port.
   * @override
   */
  public async getCharacter() {
    if (this.isDisposed || !!!this.mPort) {
      throw new ObjectDisposedException('Rs232SerialPort');
    }

    if (!this.isOpen) {
      throw new InvalidOperationException(`Port not open at ${this.mDevice}`);
    }

    try {
      const result = this.mPort.read(1) as Buffer;
      if (!!result && result.length === 1) {
        return result.toString();
      }
    } catch (e) {
      let msg = `Error reading data from port ${this.mDevice}`;
      if (e && e.message) {
        msg = `${msg}: ${e.message}`;
      }

      throw new IOException(msg);
    }

    return null;
  }

  private async internalWrite(data: Buffer) {
    if (this.isDisposed || !!!this.mPort) {
      throw new ObjectDisposedException('Rs232SerialPort');
    }

    if (!this.isOpen) {
      throw new InvalidOperationException(`Port not open at ${this.mDevice}`);
    }

    try {
      const asyncWrite = Util.promisify(this.mPort.write).bind(this.mPort);
      const result = (await asyncWrite(data)) as boolean;
      if (!result) {
        const asyncDrain = Util.promisify(this.mPort.drain).bind(this.mPort);
        await asyncDrain();
      }
    } catch (e) {
      let msg = `Error writing data to port ${this.mDevice}`;
      if (e && e.message) {
        msg = `${msg}: ${e.message}`;
      }

      throw new IOException(msg);
    }
  }
}
