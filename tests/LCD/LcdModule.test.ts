import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../src/lib/ExecUtils';
import GpioTransferProviderStandard from '../../src/lib/LCD/GpioTransferProviderStandard';
import LcdModule from '../../src/lib/LCD/LcdModule';
import IllegalArgumentException from '../../src/lib/IllegalArgumentException';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';
import { GpioPins, PinState } from '../../src/lib/IO';

jest.mock('fs');
jest.mock('../../src/lib/ExecUtils');

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
    let lcd = new LcdModule(provider);
    expect(lcd.isDisposed).toBeFalsy();
    expect(lcd.provider).toBeInstanceOf(GpioTransferProviderStandard);
    
    await lcd.dispose();
    expect(lcd.isDisposed).toBeTruthy();
    await lcd.dispose();  // again for coverage

    buildProvider(false);
    lcd = new LcdModule(provider);
    await lcd.dispose();
});

test("Can begin", async () => {
    buildProvider();
    
    let lcd = new LcdModule(provider);
    await lcd.begin(4, 1, true, true);
    expect(lcd.columns).toBe(4);
    expect(lcd.rows).toBe(1);
    expect(lcd.visible).toBeTruthy();
    expect(lcd.showCursor).toBeFalsy();
    expect(lcd.blinkCursor).toBeFalsy();
    expect(lcd.backlightEnabled).toBeTruthy();

    await lcd.dispose();
    const err = new ObjectDisposedException('LcdModule');
    await expect(lcd.begin(4, 1, true, true)).rejects.toThrow(err);

    buildProvider(false);
    lcd = new LcdModule(provider);
    await lcd.begin(4, 2, false, true);
    expect(lcd.rows).toBe(2);
    await lcd.dispose();
});

test("Can change cursor visibility", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    expect(lcd.showCursor).toBeTruthy();

    await lcd.setShowCursor(false);
    expect(lcd.showCursor).toBeFalsy();

    await lcd.dispose();
});

test("Can change cursor blink", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    expect(lcd.blinkCursor).toBeTruthy();

    await lcd.setBlinkCursor(false);
    expect(lcd.blinkCursor).toBeFalsy();

    await lcd.dispose();
});

test("Can change display visibility", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    expect(lcd.visible).toBeTruthy();

    await lcd.setVisible(false);
    expect(lcd.visible).toBeFalsy();

    await lcd.dispose();
});

test("Can change backlight", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    expect(lcd.backlightEnabled).toBeTruthy();

    await lcd.setBacklightEnabled(false);
    expect(lcd.backlightEnabled).toBeFalsy();

    await lcd.dispose();
});

test("Can write data", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.writeByte(1);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.writeByte(1)).rejects.toThrow(err);
});

test("Can create char", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.createChar(1, [1, 2]);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.createChar(1, [1, 2])).rejects.toThrow(err);
});

test("Can write buffer data", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.write(new Buffer("Test"), 0, 1);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.write(new Buffer("Test"), 0, 1)).rejects.toThrow(err);
});

test("Can write string", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.writeString("test");

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.writeString("test")).rejects.toThrow(err);
});

test("Can move cursor", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.moveCursor(true);
    await lcd.moveCursor(false);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.moveCursor(false)).rejects.toThrow(err);
});

test("Can scroll display left and right", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.scrollDisplayLeft();
    await lcd.scrollDisplayRight();

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.scrollDisplayRight()).rejects.toThrow(err);
});

test("Can set cursor position", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.setCursorPosition(1, 2);

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.setCursorPosition(1, 2)).rejects.toThrow(err);
});

test("Can return home", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.returnHome();

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.returnHome()).rejects.toThrow(err);
});

test("Can clear display", async () => {
    buildProvider();
    const lcd = new LcdModule(provider);
    await lcd.clear();

    await lcd.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(lcd.clear()).rejects.toThrow(err);
});