import * as I2cNative from '../../../src/lib/IO/I2C/I2cMock';
import { mocked } from 'ts-jest/utils';
import I2CBus from '../../../src/lib/IO/I2C/I2CBus';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';
import IOException from '../../../src/lib/IO/IOException';

jest.mock('../../../src/lib/IO/I2C/I2cMock');
const mockedBus = mocked(I2cNative, true);
mockedBus.openSync.mockReturnValue(I2cNative.mock);

test("Can open and close bus", async () => {
    let bus = new I2CBus();
    expect(bus.isOpen).toBeFalsy();

    await bus.open();
    expect(bus.isOpen).toBeTruthy();
    await bus.open();  // Again for coverage.

    await bus.close();
    expect(bus.isOpen).toBeFalsy();

    await bus.dispose();
    await bus.close();  // Just for coverage.
    const dispErr = new ObjectDisposedException("I2CBus");
    await expect(bus.open()).rejects.toThrow(dispErr);

    const ioErr = new IOException('Error opening bus 0.');
    bus = new I2CBus();
    mockedBus.openSync.mockReturnValueOnce(null);
    await expect(bus.open()).rejects.toThrow(ioErr);
});

test("Can dispose", async () => {
    const bus = new I2CBus();
    expect(bus.isDisposed).toBeFalsy();
    
    await bus.dispose();
    expect(bus.isDisposed).toBeTruthy();

    await bus.dispose(); // Just for coverage.
});

test("Can write bytes", async() => {
    let bus = new I2CBus();
    await bus.open();

    let buf = Buffer.from([1, 1, 1]);
    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(3);
    await bus.writeBytes(1, buf);

    await bus.dispose();
    const dispErr = new ObjectDisposedException("I2CBus");
    await expect(bus.writeBytes(1, buf)).rejects.toThrow(dispErr);

    bus = new I2CBus();
    await bus.open();
    await bus.close();
    const iopErr = new InvalidOperationException("No open connection to write to.");
    await expect(bus.writeBytes(1, buf)).rejects.toThrow(iopErr);

    await bus.open();
    buf = Buffer.from([1, 1, 1, 1]);
    await expect(bus.writeBytes(1, buf)).rejects.toThrow();

    buf = Buffer.from([1, 1, 1]);
    mockedInstance.i2cWriteSync.mockReturnValue(4);
    await expect(bus.writeBytes(1, buf)).rejects.toThrow();

    mockedInstance.i2cWriteSync.mockReturnValue(1);
    bus.writeByte(1, 1);
});

test("Can write commands", async () => {
    let bus = new I2CBus();
    await bus.open();

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(1);
    await bus.writeCommand(1, 1);

    mockedInstance.i2cWriteSync.mockReturnValue(2);
    await bus.writeCommand(1, 1, 1);
    await bus.writeCommand(1, 1, undefined, 1);

    mockedInstance.i2cWriteSync.mockReturnValue(3);
    await bus.writeCommand(1, 1, 1, 1);
    await bus.writeCommandByte(1, 1, 1);
});

test("Can read bytes", async () => {
    let bus = new I2CBus();
    await bus.open();

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cReadSync.mockReturnValue(3);

    let result = await bus.readBytes(1, 3);
    expect(result.length).toBe(3);

    await bus.dispose();
    const dispErr = new ObjectDisposedException("I2CBus");
    await expect(bus.readBytes(1, 3)).rejects.toThrow(dispErr);

    bus = new I2CBus();
    await bus.open();
    await bus.close();
    const iopErr = new InvalidOperationException("No open connection to read from.");
    await expect(bus.readBytes(1, 3)).rejects.toThrow(iopErr);

    await bus.open();
    mockedInstance.i2cReadSync.mockReturnValue(0);
    const ioErr = new IOException('Error reading from address 1: I2C transaction failed.');
    await expect(bus.readBytes(1, 3)).rejects.toThrow(ioErr);

    mockedInstance.i2cReadSync.mockReturnValue(1);
    let resultVal = await bus.read(1);
    expect(resultVal).toBe(0);
});