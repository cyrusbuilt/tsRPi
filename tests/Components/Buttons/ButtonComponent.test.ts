import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import ButtonComponent from '../../../src/lib/Components/Buttons/ButtonComponent';
import { ButtonState } from '../../../src/lib/Components/Buttons/ButtonState';
import ButtonEvent from '../../../src/lib/Components/Buttons/ButtonEvent';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import InvalidOperationException from '../../../src/lib/InvalidOperationException';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(true);
mockedFS.writeFileSync.mockReturnValue();

let pin = new GpioStandard(GpioPins.GPIO01, PinMode.IN, PinState.LOW);

function reInitPins() {
    pin = new GpioStandard(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
}

test("Can construct/destruct", async () => {
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    const button = new ButtonComponent(pin, props);
    expect(button.isDisposed).toBeFalsy();
    expect(button.pin.address).toBe(pin.address);
    
    await button.dispose();
    expect(button.isDisposed).toBeTruthy();
    await button.dispose();  // again for coverage.
});

test("Can get state", async () => {
    reInitPins();
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));
    await pin.read();
    const button = new ButtonComponent(pin, props);
    expect(button.state).toBe(ButtonState.RELEASED);
    expect(button.isReleased).toBeTruthy();
    expect(button.isState(ButtonState.RELEASED)).toBeTruthy();

    mockedFS.readFileSync.mockReturnValue(Buffer.from("1"));
    await pin.write(PinState.HIGH);
    await pin.read();
    expect(button.state).toBe(ButtonState.PRESSED);
    expect(button.isPressed).toBeTruthy();
    expect(button.isState(ButtonState.PRESSED)).toBeTruthy();

    await button.dispose();
});

test("Can poll and interrupt", async () => {
    reInitPins();
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));
    await pin.read();
    const button = new ButtonComponent(pin, props);
    expect(button.isPolling).toBeFalsy();

    button.poll();
    button.poll();  // again for coverage.
    expect(button.isPolling).toBeTruthy();

    button.interruptPoll();
    expect(button.isPolling).toBeFalsy();

    await button.dispose();
    const err = new ObjectDisposedException('ButtonComponent');
    expect(() => button.poll()).toThrow(err);
});

test("Can check pressed state changed", async () => {
    reInitPins();
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));
    await pin.read();
    const button = new ButtonComponent(pin, props);
    const listener = button.addButtonStateEventListener((evt: ButtonEvent) => {
        expect(evt.isPressed).toBeTruthy();
    });

    mockedFS.readFileSync.mockReturnValue(Buffer.from("1"));
    await pin.write(PinState.HIGH);
    await pin.read();
});

test("Can check released state changed", async () => {
    reInitPins();
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    mockedFS.readFileSync.mockReturnValue(Buffer.from("1"));
    await pin.read();
    const button = new ButtonComponent(pin, props);
    const listener = button.addButtonStateEventListener((evt: ButtonEvent) => {
        expect(evt.isReleased).toBeTruthy();
        expect(evt.button).toBe(button);
        expect(evt.isState(ButtonState.RELEASED)).toBeTruthy();
    });

    mockedFS.readFileSync.mockReturnValue(Buffer.from("0"));
    await pin.write(PinState.LOW);
    await pin.read();
});

test("Exceptions thrown", async () => {
    reInitPins();
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    const button = new ButtonComponent(pin, props);
    pin.mode = PinMode.OUT;

    const err = new InvalidOperationException('The pin this button is attached to' + ' must be configured as an input.');
    expect(() => button.poll()).toThrow(err);

    const listener2 = button.addButtonStateEventListener((evt: ButtonEvent) => {
        expect(evt.isReleased).toBeTruthy();
    });
    listener2.remove();  // for coverage.

    await button.dispose();
    const err2 = new ObjectDisposedException('ButtonBase');
    expect(() => {
        const listener = button.addButtonStateEventListener((evt: ButtonEvent) => {
            expect(evt.isReleased).toBeTruthy();
        });
    }).toThrow(err2);

    expect(() => {
        button.onButtonPressed(new ButtonEvent(button));
    }).toThrow(err2);

    expect(() => {
        button.onButtonReleased(new ButtonEvent(button));
    }).toThrow(err2);

    expect(() => {
        button.onButtonHold(new ButtonEvent(button));
    }).toThrow(err2);

    expect(() => {
        button.onStateChanged(new ButtonEvent(button));
    }).toThrow(err2);
});