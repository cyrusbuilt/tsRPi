import * as OS from 'os';
import * as Util from 'util';
import { BoardRevision } from '../../BoardRevision';
import IllegalArgumentException from '../../IllegalArgumentException';
import InvalidOperationException from '../../InvalidOperationException';
import ObjectDisposedException from '../../ObjectDisposedException';
import IOException from '../IOException';
import * as I2CNativeMock from './I2cMock';
import II2C from './II2C';

/**
 * @classdesc An I2C bus implementation for the Raspberry Pi. Derived from the
 * i2c-bus library by 'fivdi' at https://github.com/fivdi/i2c-bus.
 * @implements [[II2C]]
 */
export default class I2CBus implements II2C {
  private busId: number;
  private objDisposed: boolean;
  private busOpen: boolean;
  private bus: I2CNativeMock.I2cBus | null;

  /**
   * Initializes a new instance of the I2CBus class with the
   * board revision which will be used to determine bus path.
   * @param boardRev The board revision. Use one of the [[BoardRevision]]
   * values.
   */
  constructor(boardRev: BoardRevision = BoardRevision.Rev1) {
    this.busId = 1;
    if (boardRev === BoardRevision.Rev1) {
      this.busId = 0;
    }

    this.objDisposed = false;
    this.busOpen = false;
    this.bus = null;
  }

  /**
   * Gets whether or not this instance has been disposed.
   * @returns true if disposed; Otherwise, false.
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.objDisposed;
  }

  /**
   * Gets whether or not the bus connection is open.
   * @returns true if open; Otherwise, false.
   * @readonly
   * @override
   */
  public get isOpen() {
    return this.busOpen;
  }

  /**
   * Opens the I2C bus connection.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if the bus connection could not be opened.
   * @override
   */
  public async open() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('I2CBus');
    }

    if (this.isOpen) {
      return;
    }

    if (OS.arch() === 'arm') {
      const busActual = await import('i2c-bus');
      this.bus = busActual.openSync(this.busId);
    } else {
      this.bus = I2CNativeMock.openSync(this.busId);
    }

    if (Util.isNullOrUndefined(this.bus)) {
      throw new IOException(`Error opening bus ${this.busId}.`);
    }

    this.busOpen = true;
  }

  /**
   * Closes the I2C bus connection.
   * @override
   */
  public async close() {
    if (this.isDisposed) {
      return;
    }

    if (this.isOpen) {
      if (!Util.isNullOrUndefined(this.bus)) {
        this.bus.closeSync();
      }

      this.busOpen = false;
    }
  }

  /**
   * Closes the bus connection and disposes all managed resources.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.close();
    this.bus = null;
    this.objDisposed = true;
  }

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
   * @override
   */
  public async writeBytes(address: number, buffer: Buffer) {
    if (this.isDisposed || this.bus === null) {
      throw new ObjectDisposedException('I2CBus');
    }

    if (!this.isOpen) {
      throw new InvalidOperationException('No open connection to write to.');
    }

    if (buffer.length > 3) {
      throw new IllegalArgumentException('Cannot write more than 3 bytes at a time.');
    }

    const written = this.bus.i2cWriteSync(address, buffer.length, buffer);
    if (written !== buffer.length) {
      throw new IOException(`Error writing to address ${address}: I2C transaction failed.`);
    }
  }

  /**
   * Writes a single byte to the specified device address.
   * @param address The device address.
   * @param byte The byte value to write.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IOException]] if unable to write to the bus.
   * @override
   */
  public async writeByte(address: number, byte: number) {
    const bytes = new Array<number>(1);
    bytes[0] = byte;
    return this.writeBytes(address, Buffer.from(bytes));
  }

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
   * @override
   */
  public async writeCommand(address: number, command: number, data1?: number, data2?: number) {
    let bytes = new Array<number>(1);
    bytes[0] = command;

    if (!!data1) {
      bytes = new Array<number>(2);
      bytes[0] = command;
      bytes[1] = data1;
    }

    if (!!data2) {
      bytes = new Array<number>(2);
      bytes[0] = command;
      bytes[1] = data2;
    }

    if (!!data1 && !!data2) {
      bytes = new Array<number>(3);
      bytes[0] = command;
      bytes[1] = data1;
      bytes[2] = data2;
    }

    return this.writeBytes(address, Buffer.from(bytes));
  }

  /**
   * Writes a command with data to the specified device address.
   * @param address The address of the target device.
   * @param command The command to send to the device.
   * @param data The data to send with the command.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] if there is no open connection
   * to write to.
   * @throws [[IOException]] if unable to write to the bus.
   * @override
   */
  public async writeCommandByte(address: number, command: number, data: number) {
    const bytes = new Array<number>(3);
    bytes[0] = command;
    bytes[1] = data && 0xff;
    bytes[2] = data >> 8;
    return this.writeBytes(address, Buffer.from(bytes));
  }

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
   * @override
   */
  public async readBytes(address: number, count: number) {
    if (this.isDisposed || !!!this.bus) {
      throw new ObjectDisposedException('I2CBus');
    }

    if (!this.isOpen) {
      throw new InvalidOperationException('No open connection to read from.');
    }

    const buffer = new Array<number>(count);
    const result = Buffer.from(buffer);
    const bytesRead = this.bus.i2cReadSync(address, buffer.length, result);
    if (bytesRead <= 0) {
      throw new IOException(`Error reading from address ${address}: I2C transaction failed.`);
    }

    return result;
  }

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
   * @override
   */
  public async read(address: number) {
    const result = await this.readBytes(address, 1);
    return result[0];
  }
}
