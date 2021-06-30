import MicrochipPotDeviceController from '../../../../src/lib/Components/Potentiometers/Microchip/MicrochipPotDeviceController';
import * as I2cNative from '../../../../src/lib/IO/I2C/I2cMock';
import I2CBus from '../../../../src/lib/IO/I2C/I2CBus';
import { BusMock } from '../../../../src/lib/IO/I2C/I2CBusMock';
import ObjectDisposedException from '../../../../src/lib/ObjectDisposedException';
import InvalidOperationException from '../../../../src/lib/InvalidOperationException';
import IOException from '../../../../src/lib/IO/IOException';
import { mocked } from 'ts-jest/utils';
import { BoardRevision } from '../../../../src/lib/BoardRevision';

jest.mock('../../../../src/lib/IO/I2C/I2cMock');
const mockedBus = mocked(I2cNative, true);
mockedBus.openSync.mockReturnValue(I2cNative.mock);

test("Can construct and destruct", async () => {
	const bus = new I2CBus();
	const controller = new MicrochipPotDeviceController(bus, 0x05);
	await controller.begin();
	expect(controller.isDisposed).toBeFalsy();

	await controller.dispose();
	expect(controller.isDisposed).toBeTruthy();

	await controller.dispose(); // again for coverage
});

test("Can begin and get device status", async () => {
	const bus = new I2CBus();
	let controller = new MicrochipPotDeviceController(bus, 0x05);
	await controller.begin();

	const mock = mocked(I2cNative.mock, true);
	mock.i2cWriteSync.mockReturnValue(1);
	mock.i2cReadSync.mockReturnValue(17891328);
	
	const stat = await controller.getDeviceStatus();
	expect(stat.channelALocked).toBeFalsy();

	await controller.dispose();
});