import { MicrochipPotChannel } from '../../../../src/lib/Components/Potentiometers/Microchip/MicrochipPotChannel';
import MicrochipPotDeviceStatus from '../../../../src/lib/Components/Potentiometers/Microchip/MicrochipPotDeviceStatus';

test("Can construct and read props", () => {
	const stat = new MicrochipPotDeviceStatus(MicrochipPotChannel.A, true, true, true);
	expect(stat.isEepromWriteActive).toBeTruthy();
	expect(stat.isEepromWriteProtected).toBeTruthy();
	expect(stat.wiperLockActive).toBeTruthy();
	expect(stat.wiperLockChannel).toBe(MicrochipPotChannel.A);
});