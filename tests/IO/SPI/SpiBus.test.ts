import * as Util from 'util';
import SpiBusFactory, { order, mode } from '../../../src/lib/IO/SPI/SpiBus';
import PiFaceGpioDigital from '../../../src/lib/IO/PiFaceGpioDigital';

test("Can create mock bus and get/set properties and echo data", async () => {
    const bus = SpiBusFactory.create("/dev/null", true);
    expect(bus).toBeDefined();

    expect(bus.bitOrder()).toBe(order.LSB_FIRST);
    bus.bitOrder(order.MSB_FIRST);
    expect(bus.bitOrder()).toBe(order.MSB_FIRST);

    expect(bus.clockSpeed()).toBe(0);
    bus.clockSpeed(PiFaceGpioDigital.SPI_SPEED);
    expect(bus.clockSpeed()).toBe(PiFaceGpioDigital.SPI_SPEED);

    expect(bus.dataMode()).toBe(mode.CPHA);
    bus.dataMode(mode.CPOL);
    expect(bus.dataMode()).toBe(mode.CPOL);

    let success = true;
    const data = Buffer.from("test");
    const asyncWrite = Util.promisify(bus.write).bind(bus);
    const asyncRead = Util.promisify(bus.read).bind(bus);

    try {
        await asyncWrite(data);
    }
    catch (e) {
        if (e.message !== 'no error') {
            success = false;
        }
    }

    expect(success).toBeTruthy();

    success = true;
    try {
        const result = await asyncRead(data.length);
        expect(result).toBe(data);
    }
    catch(e) {
        if (e.message !== 'no error') {
            success = false;
        }
    }

    expect(success).toBeTruthy();

    // We don't need to explicity test transfer() becuase read() and write() call transfer().
});