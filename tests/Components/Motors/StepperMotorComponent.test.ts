import StepperMotorComponent from '../../../src/lib/Components/Motors/StepperMotorComponent';
import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../../src/lib/ExecUtils';
import { GpioPins } from '../../../src/lib/IO/GpioPins';
import { PinMode } from '../../../src/lib/IO/PinMode';
import { PinState } from '../../../src/lib/IO/PinState';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import GpioStandard from '../../../src/lib/IO/GpioStandard';
import IGpio from '../../../src/lib/IO/IGpio';
import IllegalArgumentException from '../../../src/lib/IllegalArgumentException';
import MotorStateChangeEvent from '../../../src/lib/Components/Motors/MotorStateChangeEvent';
import { MotorState } from '../../../src/lib/Components/Motors/MotorState';
import MotorRotateEvent from '../../../src/lib/Components/Motors/MotorRotateEvent';
import Coreutils from '../../../src/lib/PiSystem/CoreUtils';

jest.mock('fs');
jest.mock('../../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(true);
mockedFS.writeFileSync.mockReturnValue();

let pins: IGpio[] = [
    new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW),
    new GpioStandard(GpioPins.GPIO04, PinMode.OUT, PinState.LOW),
    new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW)
];

function reInitPins() {
    pins = [
        new GpioStandard(GpioPins.GPIO01, PinMode.OUT, PinState.LOW),
        new GpioStandard(GpioPins.GPIO04, PinMode.OUT, PinState.LOW),
        new GpioStandard(GpioPins.GPIO07, PinMode.OUT, PinState.LOW)
    ];
}

test("Can construct/destruct", async () => {
    let motor = null;
    pins = [];
    const argErr = new IllegalArgumentException('pins param cannot be an empty array');
    expect(() => { motor = new StepperMotorComponent(pins); }).toThrow(argErr);

    reInitPins();
    motor = new StepperMotorComponent(pins);
    expect(motor.isDisposed).toBeFalsy();

    await motor.begin();
    
    await motor.dispose();
    expect(motor.isDisposed).toBeTruthy();

    const err = new ObjectDisposedException('StepperMotorComponent');
    await expect(motor.begin()).rejects.toThrow(err);

    await motor.dispose();  // Again for coverage.
});

test("Can change state", async () => {
    reInitPins();
    const motor = new StepperMotorComponent(pins);
    expect(motor.state).toBe(MotorState.STOPPED);

    await motor.setState(MotorState.FORWARD);
    expect(motor.isState(MotorState.FORWARD));
    expect(motor.state).toBe(MotorState.FORWARD);
    expect(motor.isStopped).toBeFalsy();

    await Coreutils.delay(11);
    await motor.dispose();

    const err = new ObjectDisposedException('StepperMotorComponent');
    await expect(motor.setState(MotorState.STOPPED)).rejects.toThrow(err);
});

test("Can change direction and intercept events", async () => {
    reInitPins();
    const motor = new StepperMotorComponent(pins);
    let fwd = motor.addMotorForwardEventHandler(() => {
        expect(motor.state).toBe(MotorState.FORWARD);
    });
    let rev = motor.addMotorReverseEventHandler(() => {
        expect(motor.state).toBe(MotorState.REVERSE);
    });
    let stp = motor.addMotorStoppedEventHandler(() => {
        expect(motor.state).toBe(MotorState.STOPPED);
    });
    let stateChg = motor.addMotorStateChangeEventListener((evt: MotorStateChangeEvent) => {
        expect(evt.oldState != evt.newState).toBeTruthy();
    });

    await motor.begin();
    jest.useFakeTimers();
    await motor.forward(5);
    await motor.forward(5);  // Again for coverage.
    await motor.stop();
    await motor.stop();      // Again for coverage.
    await motor.reverse(5);
    await motor.reverse(5);  // Again for coverage.
    await motor.stop();
    jest.runAllTimers();

    fwd.remove();
    rev.remove();
    stp.remove();
    stateChg.remove();
    await motor.dispose();

    const err = new ObjectDisposedException('MotorBase');
    const err2 = new ObjectDisposedException('StepperMotorComponent');
    expect(() => { fwd = motor.addMotorForwardEventHandler(() => {}); }).toThrow(err);
    expect(() => { rev = motor.addMotorReverseEventHandler(() => {}); }).toThrow(err);
    expect(() => { stp = motor.addMotorStoppedEventHandler(() => {}); }).toThrow(err);
    expect(() => { stateChg = motor.addMotorStateChangeEventListener((evt: MotorStateChangeEvent) => {}); }).toThrow(err);
    expect(() => { motor.onMotorStateChanged(new MotorStateChangeEvent(MotorState.FORWARD, MotorState.STOPPED)); }).toThrow(err);
    await expect(motor.forward(5)).rejects.toThrow(err);
    await expect(motor.stop()).rejects.toThrow(err2);
    await expect(motor.reverse(5)).rejects.toThrow(err);
});

test("Can step and fire rotate events", async () => {
    reInitPins();
    let steps = 5;
    const revs = 5;
    const motor = new StepperMotorComponent(pins);
    motor.stepsPerRevolution = steps;
    motor.setStepInterval(0, 0.001);
    expect(motor.stepIntervalMillis).toBe(0);
    expect(motor.stepIntervalNanos).toBe(0.001);

    await motor.begin();
    
    let startEvt = motor.addRotationEventListener((evt: MotorRotateEvent) => {
        expect(evt.steps).toBe(steps * revs);
    });

    let stopEvt = motor.addRotationStoppedEventListener(() => {
        expect(motor.state).toBe(MotorState.STOPPED);
    });

    await motor.rotate(revs);

    startEvt.remove();
    stopEvt.remove();
    steps = 0;
    motor.stepsPerRevolution = steps;
    await motor.step(steps);
    steps = -1;
    motor.stepSequence = [5];
    motor.stepsPerRevolution = steps;
    await motor.step(steps);

    await motor.dispose();

    const err = new ObjectDisposedException('StepperMotorComponent');
    await expect(motor.step(steps)).rejects.toThrow(err);

    const err2 = new ObjectDisposedException('StepperMotorBase');
    expect(() => { stopEvt = motor.addRotationStoppedEventListener(() => {}); }).toThrow(err2);
    expect(() => { startEvt = motor.addRotationEventListener((evt: MotorRotateEvent) => {}); }).toThrow(err2);
    expect(() => { motor.onRotationStarted(new MotorRotateEvent(3)); }).toThrow(err2);
    expect(() => { motor.onRotationStopped(); }).toThrow(err2);
    expect(() => { motor.setStepInterval(1, 1); }).toThrow(err2);
    await expect(motor.rotate(1)).rejects.toThrow(err2);
});