import DimmableLightComponent from '../../../src/lib/Components/Lights/DimmableLightComponent';
import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import LightStateChangeEvent from '../../../src/lib/Components/Lights/LightStateChangeEvent';
import LightLevelChangeEvent from '../../../src/lib/Components/Lights/LightLevelChangeEvent';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(true);
mockedFS.writeFileSync.mockReturnValue();

let pin = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.LOW);

function reInitPins() {
    pin = new GpioStandard(GpioPins.GPIO01, PinMode.PWM, PinState.LOW);
}

test("Can construct and destruct", async () => {
    const dimmer = new DimmableLightComponent(pin, 0, 100);
    expect(dimmer.isDisposed).toBeFalsy();
    expect(dimmer.minLevel).toBe(0);
    expect(dimmer.maxLevel).toBe(100);

    await dimmer.dispose();
    expect(dimmer.isDisposed).toBeTruthy();

    await dimmer.dispose();
});

test("Can init", async () => {
    reInitPins();
    const dimmer = new DimmableLightComponent(pin, 0, 100);
    await dimmer.begin();

    await dimmer.dispose();
    const err = new ObjectDisposedException('DimmableLightComponent');
    await expect(dimmer.begin()).rejects.toThrow(err);
});

test("Can set light level", async () => {
    reInitPins();
    const dimmer = new DimmableLightComponent(pin, 0, 100);
    await dimmer.begin();

    // Try with valid values first
    await dimmer.setLevel(dimmer.maxLevel);
    expect(dimmer.level).toBe(dimmer.maxLevel);

    await dimmer.setLevel(dimmer.minLevel);
    expect(dimmer.level).toBe(dimmer.minLevel);

    expect(dimmer.getLevelPercentage(50)).toBe(50);
    expect(dimmer.getLevelPercentage(-5)).toBe(dimmer.minLevel);
    expect(dimmer.getLevelPercentage(200)).toBe(dimmer.maxLevel);

    // Now try with bad values.
    const badMinErr = new RangeError('Level cannot be less than minLevel');
    await expect(dimmer.setLevel(-4)).rejects.toThrow(badMinErr);

    const badMaxErr = new RangeError('Level cannot be greater than maxLevel');
    await expect(dimmer.setLevel(500)).rejects.toThrow(badMaxErr);

    await dimmer.dispose();
    const err = new ObjectDisposedException('DimmableLightComponent');
    await expect(dimmer.setLevel(5)).rejects.toThrow(err);

    expect(dimmer.level).toBe(0);
    const err2 = new ObjectDisposedException('DimmableLightBase');
    expect(() => { const result = dimmer.getLevelPercentage(5) }).toThrow(err2);
});

test("Can turn on and off", async () => {
    reInitPins();
    const dimmer = new DimmableLightComponent(pin, 0, 100);
    await dimmer.begin();

    await dimmer.turnOn();
    expect(dimmer.isOn).toBeTruthy();
    expect(dimmer.level).toBe(dimmer.maxLevel);

    await dimmer.turnOff();
    expect(dimmer.isOff).toBeTruthy();
    expect(dimmer.level).toBe(dimmer.minLevel);

    await dimmer.dispose();
    const err = new ObjectDisposedException('DimmableLightBase');
    await expect(dimmer.turnOn()).rejects.toThrow(err);
    await expect(dimmer.turnOff()).rejects.toThrow(err);
});

test("Can trigger and handle events", async () => {
    reInitPins();
    let dimmer = new DimmableLightComponent(pin, 0, 100);
    await dimmer.dispose();

    const err = new ObjectDisposedException('DimmableLightBase');
    expect(() => { dimmer.addLightStateChangeEventListener((evt: LightStateChangeEvent) => {}) }).toThrow(err);
    expect(() => { dimmer.addLightLevelChangeEventListener((evt: LightLevelChangeEvent) => {}) }).toThrow(err);
    expect(() => { dimmer.onLightStateChange(new LightStateChangeEvent(true)) }).toThrow(err);
    expect(() => { dimmer.onLightLevelChanged(new LightLevelChangeEvent(dimmer.minLevel)) }).toThrow(err);

    reInitPins();
    dimmer = new DimmableLightComponent(pin, 0, 100);
    await dimmer.begin();

    let stateEvt = dimmer.addLightStateChangeEventListener((evt: LightStateChangeEvent) => {});
    stateEvt.remove();

    stateEvt = dimmer.addLightStateChangeEventListener((evt: LightStateChangeEvent) => {
        expect(evt.isOn).toBeTruthy();
    });

    let levelEvt = dimmer.addLightLevelChangeEventListener((evt: LightLevelChangeEvent) => {});
    levelEvt.remove();

    levelEvt = dimmer.addLightLevelChangeEventListener((evt: LightLevelChangeEvent) => {
        expect(evt.level).toBe(dimmer.maxLevel);
    });

    await dimmer.turnOn();
    
});