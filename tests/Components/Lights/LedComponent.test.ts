import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';
import LedComponent from '../../../src/lib/Components/Lights/LedComponent';
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

test("Can construct and destruct", async () => {
    const led = new LedComponent(pin);
    expect(led.isDisposed).toBeFalsy();

    await led.dispose();
    expect(led.isDisposed).toBeTruthy();

    await led.dispose();  // Again for coverage.
});

test("Can init", async () => {
    reInitPins();
    const led = new LedComponent(pin);
    await led.begin();
    await led.dispose();

    const err = new ObjectDisposedException('LedComponent');
    await expect(led.begin()).rejects.toThrow(err);
});

test("Can turn on/off", async () => {
    reInitPins();
    let led = new LedComponent(pin);
    await led.begin();
    expect(led.isOn).toBeFalsy();

    await led.turnOn();
    expect(led.isOn).toBeTruthy();

    await led.turnOff();
    expect(led.isOff).toBeTruthy();

    await led.toggle();
    expect(led.isOn).toBeTruthy();

    await led.toggle();
    expect(led.isOff).toBeTruthy();

    pin.mode = PinMode.IN;
    const invOpErr = new InvalidOperationException('Pin is not configured as an output.');
    await expect(led.turnOn()).rejects.toThrow(invOpErr);
    await expect(led.turnOff()).rejects.toThrow(invOpErr);

    pin.mode = PinMode.OUT;
    const err = new ObjectDisposedException('LedComponent');
    await led.dispose();
    await expect(led.turnOn()).rejects.toThrow(err);
    await expect(led.turnOff()).rejects.toThrow(err);
});

test("Can pulse", async () => {
    reInitPins();
    const led = new LedComponent(pin);
    await led.begin();
    await led.pulse(3);

    const err = new ObjectDisposedException('LedComponent');
    await led.dispose();
    await expect(led.pulse(3)).rejects.toThrow(err);
});

test("Can blink", async () => {
    reInitPins();
    const led = new LedComponent(pin);
    await led.begin();

    await led.blink(3, 120);
    await led.blink(3, 0);

    const err = new ObjectDisposedException('LedComponent');
    await led.dispose();
    await expect(led.blink(1, 1)).rejects.toThrow(err);
});

test("Can trigger and handle events", async () => {
    reInitPins();
    const led = new LedComponent(pin);
    await led.begin();
    const event = led.addStateChangeEventListener((evt: LightStateChangeEvent) => {
        expect(evt.isOn).toBeTruthy();
    });

    await led.turnOn();
});