import SerialPort from 'serialport';
import Rs232SerialPort from '../../../src/lib/IO/Serial/Rs232SerialPort';
import { BaudRates } from '../../../src/lib/IO/Serial/BaudRates';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import IOException from '../../../src/lib/IO/IOException';
import IllegalArgumentException from '../../../src/lib/IllegalArgumentException';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';

const MockBinding = require('@serialport/binding-mock');
SerialPort.Binding = MockBinding;
MockBinding.createPort('/dev/ttyAMA0', { echo: true, record: true, readyData: Buffer.from('c') });

// function resetBinding() {
//     SerialPort.Binding = require('@serialport/bindings');
// }

// IMPORTANT NOTE: Make sure to close() or dispose() at the end
// of each test or the port will be locked for the next operation,
// even after creating a new object instance because the underlying
// physical or mock port will be left open. Because there are no
// destructors in TypeScript/JavaScript (since garabe collection is
// unpredictable and non-deterministic), there is no automatic
// closing of the port when the object is destroyed and there you
// MUST call close() or dispose() when done with port in order to
// release it.

test("Can create and dispose", async () => {
    let port = new Rs232SerialPort();
    expect(port.isDisposed).toBeFalsy();
    expect(port.isOpen).toBeFalsy();

    port = new Rs232SerialPort("/dev/ttyAMA0", BaudRates.BAUD9600);
    await port.dispose();
    expect(port.isDisposed).toBeTruthy();

    await port.dispose(); // For coverage.
});

test("Can open and close port", async () => {
    let port = new Rs232SerialPort();
    await port.open();
    expect(port.isOpen).toBeTruthy();
    await port.open();  // For coverage.

    await port.close();
    expect(port.isOpen).toBeFalsy();

    await port.open();
    await port.dispose();
    expect(port.isOpen).toBeFalsy();

    await port.close();  // For coverage.

    const dispErr = new ObjectDisposedException('Rs232SerialPort');
    await expect(port.open()).rejects.toThrow(dispErr);

    port = new Rs232SerialPort();
    const ioErr = new IOException("Error opening port at foo: Port does not exist - please call MockBinding.createPort('foo') first");
    await expect(port.open('foo', BaudRates.BAUD9600)).rejects.toThrow(ioErr);

    // TODO not sure how to trigger an IOException on close() if open() was successful. Maybe revert the binding temporarily?

});

test("Can flush", async () => {
    let port = new Rs232SerialPort();
    await port.open();
    await port.flush(); // Shouldn't throw.

    await port.close();
    await port.flush();  // For coverage.

    await port.dispose();
    const dispErr = new ObjectDisposedException('Rs232SerialPort');
    await expect(port.flush()).rejects.toThrow(dispErr);

    //port = new Rs232SerialPort();
    //await port.open();
    //resetBinding();
    //await port.flush();
    // TODO not sure how to trigger IOException on flush if open was successful,
    // and resetBinding() does not work unfortunately. I think the binding has
    // to be set before calling new SerialPort(), which we can't do because then
    // open() would fail if not running on an RPi running Linux.
});

test("Can write port", async () => {
    let port = new Rs232SerialPort();
    await port.open();
    await port.write(1);      // Should not throw.
    await port.putChar('c');  // Should not throw.

    const illErr = new IllegalArgumentException('param char can only be a single character use putString() for multiple.');
    await expect(port.putChar('ss')).rejects.toThrow(illErr);

    await port.putString('foo');  // Should not throw.
    
    await port.close();
    const opErr = new InvalidOperationException('Port not open at /dev/ttyAMA0');
    await expect(port.write(1)).rejects.toThrow();

    await port.dispose();
    const dispErr = new ObjectDisposedException('Rs232SerialPort');
    await expect(port.write(1)).rejects.toThrow(dispErr);

    // TODO not sure how to trigger IOException on any write method if open was successful,
    // and resetBinding() does not work unfortunately. I think the binding has
    // to be set before calling new SerialPort(), which we can't do because then
    // open() would fail if not running on an RPi running Linux.
});

test("Can get available bytes", async () => {
    let port = new Rs232SerialPort();
    await port.open();
    expect(port.getBytesAvailable()).toBe(0);

    await port.close();
    const opErr = new InvalidOperationException('Port not open at /dev/ttyAMA0');
    expect(() => port.getBytesAvailable()).toThrow(opErr);

    await port.dispose();
    const dispErr = new ObjectDisposedException('Rs232SerialPort');
    expect(() => port.getBytesAvailable()).toThrow(dispErr);
});

test("Can change props", async () => {
    let port = new Rs232SerialPort();
    port.device = 'foo';  // Should not throw.
    expect(port.device).toBe('foo');

    port.baud = BaudRates.BAUD115200;  // Should not throw.
    expect(port.baud).toBe(BaudRates.BAUD115200);

    await port.open();
    const opErr = new InvalidOperationException('You must close the current port before changing devices.');
    expect(() => { port.device = 'bar' }).toThrow(opErr);
    
    const opErr2 = new InvalidOperationException('You must close the current port before changing BAUD rates.');
    expect(() => { port.baud = BaudRates.BAUD1200 }).toThrow(opErr2);

    await port.dispose();
});

test("Can read char", async () => {
    let port = new Rs232SerialPort();
    await port.open();
    
    let char = await port.getCharacter();
    expect(char).toBeNull();

    await port.close();
    const opErr = new InvalidOperationException('Port not open at /dev/ttyAMA0');
    await expect(port.getCharacter()).rejects.toThrow(opErr);

    await port.dispose();
    const dispErr = new ObjectDisposedException('Rs232SerialPort');
    await expect(port.getCharacter()).rejects.toThrow(dispErr);

    await port.dispose();
});