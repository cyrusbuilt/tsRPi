import IOException from '../../../src/lib/IO/IOException';
import ObjectDisposedException from '../../../src/lib/ObjectDisposedException';
import AxisGyroscope from '../../../src/lib/Components/Gyroscope/AxisGyroscope';
import { GyroTriggerMode } from '../../../src/lib/Components/Gyroscope/GyroTriggerMode';
import IMultiAxisGyroscope from '../../../src/lib/Components/Gyroscope/IMultiAxisGyroscope';
import IGyro from '../../../src/lib/Components/Gyroscope/IGyro';
import ComponentBase from '../../../src/lib/Components/ComponentBase';

class FakeGyro extends ComponentBase implements IMultiAxisGyroscope {
    private td: number;

    constructor() {
        super();
        this.td = 1;
    }

    public get timeDelta() {
        return this.td;
    }

    public async init(triggeringAxis: IGyro, trigMode: GyroTriggerMode) {
        triggeringAxis.setReadTrigger(trigMode);
        return triggeringAxis;
    }

    public async enable() {
        return Promise.resolve();
    }

    public async disable() {
        return Promise.resolve();
    }

    public async readGyro() {
        return Promise.resolve();
    }

    public async recalibrateOffset() {
        return Promise.resolve();
    }
}

test("Can construct and destruct", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    expect(gyro.isDisposed).toBeFalsy();
    expect(gyro.offset).toBe(0);

    await gyro.dispose();
    expect(gyro.isDisposed).toBeTruthy();

    await gyro.dispose();  // Again for coverage.
});

test("Can set trigger mode", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    gyro.setReadTrigger(GyroTriggerMode.GET_ANGLE_TRIGGER_READ);

    expect(gyro.toString()).toBe("");

    await gyro.dispose();

    const err = new ObjectDisposedException('AxisGyroscope');
    expect(() => gyro.setReadTrigger(GyroTriggerMode.GET_ANGULAR_VELOCITY_TRIGGER_READ)).toThrow(err);
});

test("Can read and update angle", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    await expect(gyro.readAndUpdateAngle()).resolves.toBe(0);
});

test("Can get/set raw value", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    gyro.setReadTrigger(GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);
    await expect(gyro.getRawValue()).resolves.toBe(0);

    gyro.setRawValue(1);
    await expect(gyro.getRawValue()).resolves.toBe(1);

    await gyro.dispose();

    const err = new ObjectDisposedException('AxisGyroscope');
    expect(() => gyro.setRawValue(2)).toThrow(err);
    await expect(gyro.getRawValue()).rejects.toThrow(err);
});

test("Can get/set angle", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    gyro.setReadTrigger(GyroTriggerMode.GET_ANGLE_TRIGGER_READ);

    await expect(gyro.getAngle()).resolves.toBe(0);

    gyro.setAngle(1);
    await expect(gyro.getAngle()).resolves.toBe(1);

    await gyro.dispose();

    const err = new ObjectDisposedException('AxisGyroscope');
    expect(() => gyro.setAngle(2)).toThrow(err);
    await expect(gyro.getAngle()).rejects.toThrow(err);
});

test("Can get angular velocity", async () => {
    let gyro = new AxisGyroscope(new FakeGyro(), 1);

    gyro.setReadTrigger(GyroTriggerMode.GET_ANGULAR_VELOCITY_TRIGGER_READ);
    await expect(gyro.getAngularVelocity()).resolves.toBe(0);

    gyro.setReadTrigger(GyroTriggerMode.READ_NOT_TRIGGERED);
    await expect(gyro.getAngularVelocity()).resolves.toBe(0);

    gyro = new AxisGyroscope(new FakeGyro());
    await expect(gyro.getAngularVelocity()).resolves.toBe(0);

    await gyro.dispose();

    const err = new ObjectDisposedException('AxisGyroscope');
    await expect(gyro.getAngularVelocity()).rejects.toThrow(err);
});

test("Can recalibrate offset", async () => {
    const gyro = new AxisGyroscope(new FakeGyro(), 1);
    gyro.recalibrateOffset();
});