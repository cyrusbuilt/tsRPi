import LcdComponent from '../../../src/lib/Components/LcdDisplay/LcdComponent';
import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import GpioTransferProviderStandard from '../../../src/lib/LCD/GpioTransferProviderStandard';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import { GpioPins } from '../../../src/lib/IO';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';
import IllegalArgumentException from '../../../src/lib/IllegalArgumentException';
import { LcdTextAlignment } from '../../../src/lib/Components/LcdDisplay/LcdTextAligment';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(false);
mockedFS.writeFileSync.mockReturnValue();

let provider: GpioTransferProviderStandard;
function buildProvider(fourBit: boolean = true) {
    provider = new GpioTransferProviderStandard(
        GpioPins.GPIO07,
        GpioPins.GPIO08,
        GpioPins.GPIO09,
        GpioPins.GPIO10,
        GpioPins.GPIO11,
        GpioPins.GPIO14,
        GpioPins.GPIO15,
        GpioPins.GPIO17,
        fourBit,
        GpioPins.GPIO18,
        GpioPins.GPIO21,
        GpioPins.GPIO22
    );
}

test("Can construct/destruct", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    expect(lcd.isDisposed).toBeFalsy();
    expect(lcd.rowCount).toBe(2);
    expect(lcd.columnCount).toBe(16);
    expect(lcd.toString()).toBe("");

    await lcd.dispose();
    expect(lcd.isDisposed).toBeTruthy();

    await lcd.dispose();  // again for coverage.
});

test("Can init", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.dispose();
    const err = new ObjectDisposedException('LcdModule');
    await expect(lcd.begin()).rejects.toThrow(err);
});

test("Can set cursor position", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();
    await lcd.setCursorPosition(0, 0);

    // Now again with invalid position to trigger exception.
    const err = new InvalidOperationException('Invalid row index.');
    await expect(lcd.setCursorPosition(7, 10)).rejects.toThrow(err);

    const err2 = new InvalidOperationException('Invalid column index.');
    await expect(lcd.setCursorPosition(0, 55)).rejects.toThrow(err2);

    await lcd.dispose();
});

test("Can write single byte", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeSingleByte(1);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.writeSingleByte(1)).rejects.toThrow(err);
});

test("Can clear display", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.clearDisplay();  // Clear whole display.
    await lcd.clear(0, 0, 18); // Clear top row.
    await lcd.dispose();
});

test("Can send cursor to home position", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();
    await lcd.sendCursorHome();
    await lcd.dispose();
});

test("Can write a single char", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeSingleChar("a");

    // Now do this with a multi-char string which should blow up.
    const err = new IllegalArgumentException('For a single char, string length cannot be greater than 1.');
    await expect(lcd.writeSingleChar("foo")).rejects.toThrow(err);

    await lcd.dispose();
});

test("Can write bytes of data", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeByte(0, 3, 0x04);
    await lcd.writeBytes(0, 3, [0x04, 0xff, 0x01]);

    await lcd.dispose();
});

test("Can write characters", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeChar(0, 4, 'a');
    await lcd.writeChars(0, 4, ['f', 'o', 'o']);

    await lcd.dispose();
});

test("Can write string", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeString(0, "foo", LcdTextAlignment.CENTER);
    await lcd.writeString(0, "foo", LcdTextAlignment.LEFT);
    await lcd.writeString(0, "foo", LcdTextAlignment.RIGHT);

    await lcd.dispose();
});

test("Can write text lines", async () => {
    buildProvider();
    const lcd = new LcdComponent(provider, 2, 16);
    await lcd.begin();

    await lcd.writeLineAligned(0, "foo", LcdTextAlignment.LEFT);
    await lcd.writeLine(1, "bar");

    await lcd.dispose();
});