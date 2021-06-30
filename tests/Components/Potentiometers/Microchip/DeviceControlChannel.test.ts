import DeviceControlChannel from '../../../../src/lib/Components/Potentiometers/Microchip/DeviceControlChannel';
import { MicrochipPotChannel } from '../../../../src/lib/Components/Potentiometers/Microchip/MicrochipPotChannel';
import { RegisterMemoryAddress } from '../../../../src/lib/Components/Potentiometers/Microchip/RegisterMemoryAddress';
import { TerminalControlRegisterBit } from '../../../../src/lib/Components/Potentiometers/Microchip/TerminalControlRegisterBit';
import StringUtils from '../../../../src/lib/StringUtils';

test("Can get device control channel by pot channel", () => {
	const chan = DeviceControlChannel.valueOf(MicrochipPotChannel.A);
	expect(chan).not.toBeNull();
	if (chan) {
		expect(chan.volatileMemoryAddress).toBe(RegisterMemoryAddress.WIPER0);
		expect(chan.nonVolatileMemoryAddress).toBe(RegisterMemoryAddress.WIPER0_NV);
		expect(chan.terminalControlAddress).toBe(RegisterMemoryAddress.TCON01);
		expect(chan.hardwareConfigControlBit).toBe(TerminalControlRegisterBit.TCON_RH02HW);
		expect(chan.terminalAConnectionControlBit).toBe(TerminalControlRegisterBit.TCON_RH02A);
		expect(chan.terminalBConnectionControlBit).toBe(TerminalControlRegisterBit.TCON_RH02B);
		expect(chan.wiperConnectionControlBit).toBe(TerminalControlRegisterBit.TCON_RH02W);
		expect(chan.channel).toBe(MicrochipPotChannel.A);
	}
});

test("None channel returns null/empty", () => {
	let chan = DeviceControlChannel.valueOf(MicrochipPotChannel.NONE);
	expect(chan).toBeNull();

	chan = new DeviceControlChannel(
		RegisterMemoryAddress.NONE,
		RegisterMemoryAddress.NONE,
		RegisterMemoryAddress.NONE,
		TerminalControlRegisterBit.NONE,
		TerminalControlRegisterBit.NONE,
		TerminalControlRegisterBit.NONE,
		TerminalControlRegisterBit.NONE,
		MicrochipPotChannel.NONE
	);
	expect(chan.name).toBe(StringUtils.EMPTY);
});