import DeviceControllerDeviceStatus from '../../../../src/lib/Components/Potentiometers/Microchip/DeviceControllerDeviceStatus';

test("Can construct and read properties", () => {
	const stat = new DeviceControllerDeviceStatus(true, true, true, true);
	expect(stat.channelALocked).toBeTruthy();
	expect(stat.channelBLocked).toBeTruthy();
	expect(stat.eepromWriteActive).toBeTruthy();
	expect(stat.eepromWriteProtected).toBeTruthy();
});