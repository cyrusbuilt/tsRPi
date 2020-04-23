import LightComponent from '../../../src/lib/Components/Lights/LightComponent';
import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';
import LightStateChangeEvent from '../../../src/lib/Components/Lights/LightStateChangeEvent';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(true);
mockedFS.writeFileSync.mockReturnValue();

let pin = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);

function reInitPins() {
    pin = new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW);
}

test("Can construct/destruct", async () => {
    const light = new LightComponent(pin);
    expect(light.isDisposed).toBeFalsy();

    await light.dispose();
    expect(light.isDisposed).toBeTruthy();

    await light.dispose();  // Again for coverage.
});

test("Can begin", async () => {
    reInitPins();
    const light = new LightComponent(pin);
    await light.begin();
    
    await light.dispose();
    const err = new ObjectDisposedException("LightComponent");
    await expect(light.begin()).rejects.toThrow(err);
});

test("Can turn on/off", async () => {
    reInitPins();
    let light = new LightComponent(pin);
    await light.begin();
    expect(light.isOff).toBeTruthy();

    await light.turnOn();
    expect(light.isOn).toBeTruthy();

    await light.turnOff();
    expect(light.isOff).toBeTruthy();
    expect(light.isOn).toBeFalsy();

    pin = new GpioStandard(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    light = new LightComponent(pin);
    
    const invOpErr = new InvalidOperationException('Pin is not configured as an output pin.');
    await expect(light.turnOn()).rejects.toThrow(invOpErr);
    await expect(light.turnOff()).rejects.toThrow(invOpErr);

    await light.dispose();
    const err = new ObjectDisposedException("LightComponent");
    await expect(light.turnOn()).rejects.toThrow(err);
    await expect(light.turnOff()).rejects.toThrow(err);
});

test("Can trigger and handle events", async () => {
    reInitPins();
    let light = new LightComponent(pin);
    await light.begin();

    // This first one is for coverage.
    let handler = light.addStateChangeEventListener((evt: LightStateChangeEvent) => {});
    handler.remove();
    await light.dispose();
    const err = new ObjectDisposedException("LightBase");
    expect(() => { const temp = light.addStateChangeEventListener((event: LightStateChangeEvent) => { })}).toThrow(err);
    expect(() => { light.onLightStateChange(new LightStateChangeEvent(true))}).toThrow(err);

    // Now let's actually test the event.
    reInitPins();
    light = new LightComponent(pin);
    await light.begin();
    handler = light.addStateChangeEventListener((evt: LightStateChangeEvent) => {
        expect(evt.isOn).toBeTruthy();
    });
    await light.turnOn();
});