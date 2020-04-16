import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../src/lib/ExecUtils';
import GpioStandard from '../../src/lib/IO/GpioStandard';
import IRaspiGpio from '../../src/lib/IO/IRaspiGpio';
import { GpioPins } from '../../src/lib/IO/GpioPins';
import { PinMode } from '../../src/lib/IO/PinMode';
import { PinState } from '../../src/lib/IO/PinState';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';
import TM1638 from '../../src/lib/LED/TM1638';
import { TM1638LedColor } from '../../src/lib/LED/TM1638LedColor';

jest.mock('fs');
jest.mock('../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(false);
mockedFS.writeFileSync.mockReturnValue();

let clock = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
let data = new GpioStandard(GpioPins.GPIO04, PinMode.OUT, PinState.LOW);
let strobe = new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW);

function reInitPins() {
    clock = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    data = new GpioStandard(GpioPins.GPIO04, PinMode.OUT, PinState.LOW);
    strobe = new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW);
}

class TM1638TestFixture extends TM1638 {
    constructor(
        data: IRaspiGpio,
        clock: IRaspiGpio,
        strobe: IRaspiGpio,
        intensity: number,
        displays: number = 0,
        activate: boolean = true) {
        super(data, clock, strobe, intensity, displays, activate);
    }

    public getClockPin() {
        return this.clockPin;
    }

    public getDataPin() {
        return this.dataPin;
    }

    public getStrobePin() {
        return this.strobePin;
    }
}

test("Should construct with params", async () => {
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    expect(driver.isDisposed).toBeFalsy();
    await driver.dispose();
    expect(driver.isDisposed).toBeTruthy();
    await driver.dispose();  // call it again for coverage.
});

test("Can send data", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.send(1);
    expect(driver.getClockPin().mode).toBe(PinMode.OUT);
    expect(driver.getClockPin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.send(1)).rejects.toThrow(err);
});

test("Can send command", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.sendCommand(1);
    expect(driver.getStrobePin().mode).toBe(PinMode.OUT);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.sendCommand(1)).rejects.toThrow(err);
});

test("Can init", async () => {
    reInitPins();
    let driver = new TM1638TestFixture(data, clock, strobe, 50, 20, false);
    driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true); // Again with activate flag.
    await driver.begin();
    expect(driver.getClockPin().mode).toBe(PinMode.OUT);
    expect(driver.getStrobePin().mode).toBe(PinMode.OUT);
    expect(driver.getClockPin().state).toBe(PinState.HIGH);
    expect(driver.getStrobePin().state).toBe(PinState.LOW);

    await driver.setupDisplay(true, 50);
    expect(driver.isActive).toBeTruthy();
    await driver.setupDisplay(false, 50);
    expect(driver.getClockPin().state).toBe(PinState.HIGH);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setupDisplay(true, 50)).rejects.toThrow(err);
    await expect(driver.begin()).rejects.toThrow(err);
});

test("Can receive data", async () => {
    mockedFS.existsSync.mockReturnValue(true);
    mockedFS.readFileSync.mockReturnValue("1");

    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    const val = await driver.receive();
    expect(val).toEqual(255);
    expect(driver.getDataPin().mode).toBe(PinMode.OUT);
    expect(driver.getDataPin().state).toBe(PinState.LOW);
    expect(driver.getClockPin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.receive()).rejects.toThrow(err);
});

test("Can send raw data", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.sendData(1, 1);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.sendData(1, 1)).rejects.toThrow(err);
});

test("Can clear display", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.clearDisplay();
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.clearDisplay()).rejects.toThrow(err);
});

test("Can set display to string", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setDisplayToString("");
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.setDisplayToString("Test", true);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToString("Test")).rejects.toThrow(err);
});

test("Can set display", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    const vals = [1, 1];
    await driver.setDisplay(vals, vals.length);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplay(vals, vals.length)).rejects.toThrow(err);
});

test("Can clear display digit", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.clearDisplayDigit(1, true);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.clearDisplayDigit(1, false);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.clearDisplayDigit(1, false)).rejects.toThrow(err);
});

test("Can set display to error", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setDisplayToError();
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToError()).rejects.toThrow(err);
});

test("Can set display digit", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setDisplayDigit(4, 1, true);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.setDisplayDigit(4, 1, false);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayDigit(4, 1, false)).rejects.toThrow(err);
});

test("Can activate/deactive display", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.activateDisplay();
    expect(driver.isActive).toBeTruthy();

    await driver.activateDisplay(false);
    expect(driver.isActive).toBeFalsy();

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.activateDisplay()).rejects.toThrow(err);
});

test("Can set display to hex number", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setDisplayToHexNumber(5);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToHexNumber(5)).rejects.toThrow(err);
});

test("Can set display to dec number at pos", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    // This should cause the display to show 'Error'
    await driver.setDisplayToDecNumberAt(999999999, true, 0, true);

    // Try with and without dots
    await driver.setDisplayToDecNumberAt(9, true, 0, true);
    await driver.setDisplayToDecNumberAt(9, false, 0, true);

    // Try with zero and with and without leading zeros.
    await driver.setDisplayToDecNumberAt(0, true, 0, true);
    await driver.setDisplayToDecNumberAt(0, true, 0, false);

    // Try without leading zeros.
    await driver.setDisplayToDecNumberAt(9, false, 0, false);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    // Try the alternate that always starts at pos 0
    await driver.setDisplayToDecNumber(9, false, false);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToDecNumberAt(9, false, 0, false)).rejects.toThrow(err);
});

test("Can set display to signed dec number", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    // Try positive value first.
    await driver.setDisplayToSignedDecNumber(9, true, true);

    // Now try with negative num with dots.
    await driver.setDisplayToSignedDecNumber(-9, true, true);

    // and without dots
    await driver.setDisplayToSignedDecNumber(-9, false, true);

    // Try with invalid number
    await driver.setDisplayToSignedDecNumber(-99999999, false, true);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToSignedDecNumber(9, true, true)).rejects.toThrow(err);
});

test("Can set display to bin number", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setDisplayToBinNumber(4, true);
    await driver.setDisplayToBinNumber(4, false);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setDisplayToBinNumber(4, true)).rejects.toThrow(err);
});

test("Can set LED", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    await driver.setLed(TM1638LedColor.RED, 1);
    expect(driver.getStrobePin().state).toBe(PinState.HIGH);

    await driver.dispose();
    const err = new ObjectDisposedException('TM16XXBase');
    await expect(driver.setLed(TM1638LedColor.RED, 1)).rejects.toThrow(err);
});

test("Can get pushbuttons", async () => {
    reInitPins();
    const driver = new TM1638TestFixture(data, clock, strobe, 50, 20, true);
    await driver.begin();

    const result = await driver.getPushButtons();
    expect(result).toBeGreaterThan(0);
    expect(driver.getStrobePin().state).toBe(PinState.LOW);

    await driver.dispose();
    const err = new ObjectDisposedException('TM1638');
    await expect(driver.getPushButtons()).rejects.toThrow(err);
});