import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../src/lib/ExecUtils';
import GpioStandard from '../../src/lib/IO/GpioStandard';
import { GpioPins } from '../../src/lib/IO/GpioPins';
import { PinMode } from '../../src/lib/IO/PinMode';
import { PinState } from '../../src/lib/IO/PinState';
import InvalidOperationException from '../../src/lib/InvalidOperationException';
import IOException from '../../src/lib/IO/IOException';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';
import DS1620 from '../../src/lib/Sensors/DS1620';

jest.mock('fs');
jest.mock('../../src/lib/ExecUtils');

test("Can construct and dispose", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.existsSync.mockReturnValue(false);
    mockedFS.writeFileSync.mockReturnValue();

    const clock = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    const data = new GpioStandard(GpioPins.GPIO04, PinMode.IN, PinState.LOW);
    const reset = new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW);

    const sensor = new DS1620(clock, data, reset);

    expect(sensor.clockPin).toBe(clock);
    expect(sensor.dataPin).toBe(data);
    expect(sensor.resetPin).toBe(reset);
    expect(sensor.isDisposed).toBeFalsy();

    await sensor.dispose();
    expect(sensor.isDisposed).toBeTruthy();
    expect(sensor.clockPin.isDisposed).toBeTruthy();
    expect(sensor.dataPin.isDisposed).toBeTruthy();
    expect(sensor.resetPin.isDisposed).toBeTruthy();

    // Do again for coverage
    await sensor.dispose();
});

test("Can initialize", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.existsSync.mockReturnValue(false);
    mockedFS.writeFileSync.mockReturnValue();

    const clock = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    const data = new GpioStandard(GpioPins.GPIO04, PinMode.IN, PinState.LOW);
    const reset = new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW);

    const sensor = new DS1620(clock, data, reset);
    await sensor.begin();

    expect(GpioStandard.EXPORTED_PINS.includes(GpioPins.GPIO01)).toBeTruthy();
    expect(GpioStandard.EXPORTED_PINS.includes(GpioPins.GPIO04)).toBeTruthy();
    expect(GpioStandard.EXPORTED_PINS.includes(GpioPins.GPIO07)).toBeTruthy();

    await sensor.dispose();
});

test("Can acquire data", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.existsSync.mockReturnValue(true);
    mockedFS.writeFileSync.mockReturnValue();
    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));

    const clock = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    const data = new GpioStandard(GpioPins.GPIO04, PinMode.IN, PinState.LOW);
    const reset = new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW);

    const sensor = new DS1620(clock, data, reset);
    await sensor.begin();

    const val = await sensor.getTemperature();
    expect(val).toBe(0);

    await sensor.dispose();
    const objDispErr = new ObjectDisposedException("DS1620");
    await expect(sensor.getTemperature()).rejects.toThrow(objDispErr);
});