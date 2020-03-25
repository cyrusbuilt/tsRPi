import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import BuzzerComponent from '../../../src/lib/Components/Buzzers/BuzzerComponent';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(true);
mockedFS.writeFileSync.mockReturnValue();

let pin = new GpioStandard(GpioPins.GPIO07, PinMode.PWM, PinState.LOW);
function resetPin() {
    pin = new GpioStandard(GpioPins.GPIO07, PinMode.PWM, PinState.LOW);
}

test("Can construct and destruct", async () => {
    const fakeBuzzer = new BuzzerComponent(pin);
    expect(fakeBuzzer.isDisposed).toBeFalsy();
    expect(fakeBuzzer.toString()).toBe("BuzzerComponent");
    expect(fakeBuzzer.pin.pinName).toBe(pin.pinName);

    await fakeBuzzer.dispose();
    expect(fakeBuzzer.isDisposed).toBeTruthy();
    await fakeBuzzer.dispose();
});

test("Can buzz and stop buzzing", async () => {
    resetPin();
    const fakeBuzzer = new BuzzerComponent(pin);
    expect(fakeBuzzer.isBuzzing).toBeFalsy();

    await fakeBuzzer.buzz(300, 500);
    expect(fakeBuzzer.isBuzzing).toBeTruthy();

    await fakeBuzzer.stop();
    expect(fakeBuzzer.isBuzzing).toBeFalsy();

    await fakeBuzzer.buzz(-100, 500);
    await fakeBuzzer.stop();
    await fakeBuzzer.dispose();

    const err = new ObjectDisposedException("BuzzerComponent");
    await expect(fakeBuzzer.buzz(300, 500)).rejects.toThrow(err);
});