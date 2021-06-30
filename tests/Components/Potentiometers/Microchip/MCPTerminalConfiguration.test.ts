import MCPTerminalConfiguration from '../../../../src/lib/Components/Potentiometers/Microchip/MCPTerminalConfiguration';
import { MicrochipPotChannel } from '../../../../src/lib/Components/Potentiometers/Microchip/MicrochipPotChannel';

test("Can construct and read props", () => {
	const config = new MCPTerminalConfiguration(MicrochipPotChannel.A, true, true, true, true);
	expect(config.channel).toBe(MicrochipPotChannel.A);
	expect(config.isChannelEnabled).toBeTruthy();
	expect(config.isPinAenabled).toBeTruthy();
	expect(config.isPinBenabled).toBeTruthy();
	expect(config.isPinWenabled).toBeTruthy();
});