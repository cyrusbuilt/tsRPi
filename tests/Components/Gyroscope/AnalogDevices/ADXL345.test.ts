import ADXL345 from '../../../../src/lib/Components/Gyroscope/AnalogDevices/ADXL345';
import * as I2cNative from '../../../../src/lib/IO/I2C/I2cMock';
import { mocked } from 'ts-jest/utils';
import I2CBus from '../../../../src/lib/IO/I2C/I2CBus';
import ObjectDisposedException from '../../../../src/lib/ObjectDisposedException';
import { GyroTriggerMode } from '../../../../src/lib/Components/Gyroscope/GyroTriggerMode';
import IOException from '../../../../src/lib/IO/IOException';
import InvalidOperationException from '../../../../src/lib/InvalidOperationException';

jest.mock('../../../../src/lib/IO/I2C/I2cMock');
const mockedBus = mocked(I2cNative, true);
mockedBus.openSync.mockReturnValue(I2cNative.mock);

test("Can construct and destruct", async () => {
    let gyro = new ADXL345();
    expect(gyro.isDisposed).toBeFalsy();

    await gyro.dispose();
    expect(gyro.isDisposed).toBeTruthy();

    await gyro.dispose();  // Again for coverage.

    const bus = new I2CBus();
    gyro = new ADXL345(bus, 1);

    expect(gyro.timeDelta).toBe(0);
    expect(gyro.x).toBeDefined();
    expect(gyro.y).toBeDefined();
    expect(gyro.z).toBeDefined();
    expect(gyro.isEnabled).toBeFalsy();

    await gyro.dispose();
});

test("Can enable/disable", async () => {
    const bus = new I2CBus();
    await bus.open();
    const gyro = new ADXL345(bus);

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);

    await gyro.enable();
    expect(gyro.isEnabled).toBeTruthy();

    await gyro.enable(); // Again for coverage.

    await gyro.disable();
    expect(gyro.isEnabled).toBeFalsy();

    await gyro.dispose();

    const err = new ObjectDisposedException("ADXL345");
    await expect(gyro.enable()).rejects.toThrow(err);
    await expect(gyro.disable()).rejects.toThrow(err);
});

test("Can init", async () => {
    const gyro = new ADXL345();
    await gyro.init(gyro.x, GyroTriggerMode.GET_ANGLE_TRIGGER_READ);
    expect(gyro.isEnabled).toBeTruthy();
    
    await gyro.init(gyro.y, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);
    await gyro.init(gyro.z, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);

    await gyro.dispose();
    const err = new ObjectDisposedException("ADXL345");
    await expect(gyro.init(gyro.x, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ)).rejects.toThrow(err);
});

test("Can read gyro", async () => {
    const gyro = new ADXL345();

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);

    await gyro.init(gyro.x, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);

    mockedInstance.i2cWriteSync.mockReturnValue(1);
    await gyro.readGyro();

    await gyro.disable();
    const iopErr = new InvalidOperationException('Cannot read from a disabled device.');
    await expect(gyro.readGyro()).rejects.toThrow(iopErr);

    await gyro.dispose();
    const err = new ObjectDisposedException('ADXL345');
    await expect(gyro.readGyro()).rejects.toThrow(err);
});

test("Can recalibrate offset", async () => {
    const gyro = new ADXL345();
    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);
    await gyro.init(gyro.x, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);

    mockedInstance.i2cWriteSync.mockReturnValue(1);
    await gyro.recalibrateOffset();
});