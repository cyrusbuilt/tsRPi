import HMC5883L from '../../../../src/lib/Components/Gyroscope/Honeywell/HMC5883L';
import * as I2cNative from '../../../../src/lib/IO/I2C/I2cMock';
import { mocked } from 'ts-jest/utils';
import I2CBus from '../../../../src/lib/IO/I2C/I2CBus';
import ObjectDisposedException from '../../../../src/lib/ObjectDisposedException';
import { GyroTriggerMode } from '../../../../src/lib/Components/Gyroscope/GyroTriggerMode';
import InvalidOperationException from '../../../../src/lib/InvalidOperationException';
import { exportAllDeclaration } from '@babel/types';
import { MeasurementMode } from '../../../../src/lib/Components/Gyroscope/Honeywell/MeasurementMode';
import { OperationMode } from '../../../../src/lib/Components/Gyroscope/Honeywell/OperationMode';
import { HMC5883LOutputRate } from '../../../../src/lib/Components/Gyroscope/Honeywell/HMC5883LOutputRate';
import { Samples } from '../../../../src/lib/Components/Gyroscope/Honeywell/Samples';
import { HMC5883LGains } from '../../../../src/lib/Components/Gyroscope/Honeywell/HMC5883LGains';

jest.mock('../../../../src/lib/IO/I2C/I2cMock');
const mockedBus = mocked(I2cNative, true);
mockedBus.openSync.mockReturnValue(I2cNative.mock);

test("Can construct and destruct", async () => {
    let gyro = new HMC5883L();
    expect(gyro.isDisposed).toBeFalsy();

    await gyro.dispose();
    expect(gyro.isDisposed).toBeTruthy();

    await gyro.dispose();  // Again for coverage.

    const bus = new I2CBus();
    gyro = new HMC5883L(bus, 1);

    expect(gyro.timeDelta).toBe(0);
    expect(gyro.x).toBeDefined();
    expect(gyro.y).toBeDefined();
    expect(gyro.z).toBeDefined();
    expect(gyro.isEnabled).toBeFalsy();
    expect(gyro.measurementMode).toBe(MeasurementMode.NORMAL_MODE);
    expect(gyro.mode).toBe(OperationMode.CONTINUOUS);
    expect(gyro.outputRate).toBe(HMC5883LOutputRate.RATE_15_HZ);
    expect(gyro.samplesAverage).toBe(Samples.AVERAGE_8);
    expect(gyro.gain).toBe(HMC5883LGains.GAIN_1_3_GA);
    
    await gyro.dispose();
});

test("Can enable/disable", async () => {
    const bus = new I2CBus();
    await bus.open();

    let gyro = new HMC5883L(bus);
    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);

    await gyro.enable();
    expect(gyro.isEnabled).toBeTruthy();

    await gyro.enable(); // Again for coverage.

    mockedInstance.i2cWriteSync.mockReturnValue(3);
    await gyro.disable();
    expect(gyro.isEnabled).toBeFalsy();

    await gyro.disable();  // Again for coverage.

    mockedInstance.i2cWriteSync.mockReturnValue(2);
    await gyro.enable();
    const err = new ObjectDisposedException("HMC5883L");
    await gyro.dispose();
    await expect(gyro.disable()).rejects.toThrow(err);

    gyro = new HMC5883L(bus);
    await gyro.dispose();
    await expect(gyro.enable()).rejects.toThrow(err);
});

test("Can init", async () => {
    const gyro = new HMC5883L();
    await gyro.init(gyro.x, GyroTriggerMode.GET_ANGLE_TRIGGER_READ);
    expect(gyro.isEnabled).toBeTruthy();

    await gyro.init(gyro.y, GyroTriggerMode.GET_ANGLE_TRIGGER_READ);
    await gyro.init(gyro.z, GyroTriggerMode.GET_ANGLE_TRIGGER_READ);

    await gyro.dispose();
    const err = new ObjectDisposedException("HMC5883L");
    await expect(gyro.init(gyro.x, GyroTriggerMode.GET_ANGLE_TRIGGER_READ)).rejects.toThrow(err);
});

test("Can read gyro", async () => {
    const gyro = new HMC5883L();

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);

    await gyro.init(gyro.x, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);
    await gyro.readGyro();

    mockedInstance.i2cWriteSync.mockReturnValue(3);
    await gyro.disable();
    const iopErr = new InvalidOperationException('Cannot read gyro. Device is disabled.');
    await expect(gyro.readGyro()).rejects.toThrow(iopErr);

    await gyro.dispose();
    const err = new ObjectDisposedException("HMC5883L");
    await expect(gyro.readGyro()).rejects.toThrow(err);
});

test("Can recalibrate offset", async () => {
    const gyro = new HMC5883L();

    const mockedInstance = mocked(I2cNative.mock, true);
    mockedInstance.i2cWriteSync.mockReturnValue(2);

    await gyro.init(gyro.x, GyroTriggerMode.GET_RAW_VALUE_TRIGGER_READ);
    
    mockedInstance.i2cWriteSync.mockReturnValue(1);
    await gyro.recalibrateOffset();
});