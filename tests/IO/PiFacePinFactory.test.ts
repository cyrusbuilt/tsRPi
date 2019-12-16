import PiFacePinFactory from '../../src/lib/IO/PiFacePinFactory';
import { PiFacePins } from '../../src/lib/IO/PiFacePins';

test("Creates output pin", async () => {
    const result = await PiFacePinFactory.createOutputPin(PiFacePins.OUTPUT00, true);
    expect(result).toBeDefined();
});

test("Creates input pin", async () => {
    const result = await PiFacePinFactory.createInputPin(PiFacePins.INPUT00, true);
    expect(result).toBeDefined();
});