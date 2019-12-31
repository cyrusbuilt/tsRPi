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

jest.mock('fs');
jest.mock('../../src/lib/ExecUtils');

test("Should construct with and with or without params", () => {
    let gs = new GpioStandard(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(gs.isDisposed).toBeFalsy();
    expect(gs.innerPin).toBe(GpioPins.GPIO01);
    expect(gs.state).toBe(PinState.LOW);
    expect(gs.mode).toBe(PinMode.IN);
    expect(gs.getInitialPinValue()).toBe(PinState.LOW);

    gs = new GpioStandard(null);
    expect(gs.innerPin).toBe(GpioPins.GPIO_NONE);
    expect(gs.mode).toBe(PinMode.OUT);
    expect(gs.getInitialPinValue()).toBe(PinState.LOW);
});

test("Can change pwm value", () => {
    const result: string[] = [];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    
    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.LOW);
    expect(gs.pwm).toBe(0);

    gs.pwm = 256;
    expect(mockedExecUtils.executeCommand).toHaveBeenCalled();
    expect(gs.pwm).toBe(256);

    const err = new InvalidOperationException('Cannot set PWM value on a pin not configured for PWM.');
    gs.mode = PinMode.OUT;
    expect(() => { gs.pwm = 256 }).toThrow(err);
    
    gs.mode = PinMode.PWM;
    gs.pwm = -1;
    expect(gs.pwm).toBe(0);

    gs.pwm = 1048;
    expect(gs.pwm).toBe(1023);
});

test("Can change pwm range", () => {
    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.LOW);
    expect(gs.pwmRange).toBe(1024);

    gs.pwmRange = -1;
    expect(gs.pwmRange).toBe(0);

    gs.pwmRange = 2048;
    expect(gs.pwmRange).toBe(1024);

    gs.pwmRange = 256;
    expect(gs.pwmRange).toBe(256);
});

test("Can provision pin", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.existsSync.mockReturnValue(false);
    mockedFS.writeFileSync.mockReturnValue();

    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.LOW);
    await gs.provision();

    expect(mockedFS.existsSync).toHaveBeenCalled();
    expect(mockedFS.writeFileSync).toHaveBeenCalled();
    expect(GpioStandard.EXPORTED_PINS.includes(GpioPins.GPIO01)).toBeTruthy();

    await gs.provision();  // Call again for coverage
    expect(mockedFS.existsSync).toHaveBeenCalledTimes(1);

    await gs.dispose();
    const err = new ObjectDisposedException('GpioStandard');
    await expect(gs.provision()).rejects.toThrow(err);
});

test("Write changes pin state", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.writeFileSync.mockReturnValue();

    let gs = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    expect(gs.state).toBe(PinState.LOW);

    await gs.write(PinState.HIGH);
    expect(mockedFS.writeFileSync).toHaveBeenCalled();
    expect(gs.state).toBe(PinState.HIGH);

    gs = new GpioStandard(GpioPins.GPIO_NONE, PinMode.OUT, PinState.LOW);
    await gs.write(PinState.HIGH); // Call with NONE for coverage.

    const result: string[] = [];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

    await gs.dispose();
    expect(mockedExecUtils.executeCommand).toHaveBeenCalled();

    const err = new ObjectDisposedException("GpioBase");
    await expect(gs.write(PinState.HIGH)).rejects.toThrow(err);
});

test("Can pulse pin but throws when pin mode is input", async () => {
    const mockedFS = mocked(FS, true);
    mockedFS.writeFileSync.mockReturnValue();

    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    expect(gs.state).toBe(PinState.LOW);

    const result: string[] = [];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

    await gs.pulse();
    expect(mockedExecUtils.executeCommand).toHaveBeenCalled();
    expect(gs.state).toBe(PinState.LOW);

    await gs.pulse(200);
    expect(mockedExecUtils.executeCommand).toHaveBeenCalled();
    expect(gs.state).toBe(PinState.LOW);

    gs.mode = PinMode.IN;
    const err = new InvalidOperationException('You cannot pulse a pin set as in input.');
    await expect(gs.pulse()).rejects.toThrow(err);
});

test("Can read pin state changes but throws if pin path does not exist", async () => {
    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
    const mockedFS = mocked(FS, true);
    mockedFS.existsSync.mockReturnValue(true);
    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));

    let result = await gs.read();
    expect(result).toBe(PinState.LOW);

    mockedFS.readFileSync.mockReturnValue(Buffer.from("1"));
    result = await gs.read();
    expect(result).toBe(PinState.HIGH);

    mockedFS.existsSync.mockReturnValue(false);
    const pinnum = GpioPins.GPIO01.valueOf().toString();
    const err = new IOException(`Cannot read from pin ${pinnum}. Device does not exist.`);
    await expect(gs.read()).rejects.toThrow(err);
});

test("Can fully dispose pwm pin", async () => {
    const gs = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.HIGH);

    const mockedFS = mocked(FS, true);
    mockedFS.writeFileSync.mockReturnValue();

    const result: string[] = [];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

    //gs.pwm = 256;
    await gs.dispose();
    expect(mockedExecUtils.executeCommand).toHaveBeenCalled();
    expect(mockedFS.writeFileSync).toHaveBeenCalled();
    expect(gs.state).toBe(PinState.LOW);
});