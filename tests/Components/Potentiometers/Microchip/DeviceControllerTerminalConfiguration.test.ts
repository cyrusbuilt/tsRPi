import DeviceControllerTerminalConfiguration from '../../../../src/lib/Components/Potentiometers/Microchip/DeviceControllerTerminalConfiguration';
import DeviceControlChannel from '../../../../src/lib/Components/Potentiometers/Microchip/DeviceControlChannel';

test("Can contruct and read props", () => {
	const config = new DeviceControllerTerminalConfiguration(DeviceControlChannel.A, true, true, true, true);
	expect(config.channel.name).toBe(DeviceControlChannel.A.name);
	expect(config.channelEnabled).toBeTruthy();
	expect(config.pinAEnabled).toBeTruthy();
	expect(config.pinBEnabled).toBeTruthy();
	expect(config.pinWEnabled).toBeTruthy();
});
