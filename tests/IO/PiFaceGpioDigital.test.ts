import PiFaceGpioDigital from '../../src/lib/IO/PiFaceGpioDigital';
import { PiFacePins } from '../../src/lib/IO/PiFacePins';
import { PinState } from '../../src/lib/IO/PinState';
import { PinMode } from '../../src/lib/IO/PinMode';
import { PinPullResistance } from '../../src/lib/IO/PinPullResistance';
import IOException from '../../src/lib/IO/IOException';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';

test("Can construct instance", () => {
    const pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    expect(pfgd.isDisposed).toBeFalsy();
    expect(pfgd.address).toBe(PiFacePins.OUTPUT00.valueOf());
    expect(pfgd.innerPin).toBe(PiFacePins.OUTPUT00);
    expect(pfgd.mode).toBe(PinMode.OUT);
    expect(pfgd.pinName).toBe(PiFacePins[PiFacePins.OUTPUT00]);
    expect(pfgd.pullResistance).toBe(PinPullResistance.OFF);
    expect(pfgd.pwm).toBe(0);
});

test("Can initialize", async () => {
    const pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    await expect(pfgd.initialize()).rejects.toThrow(dispErr)
});

test("Can change mode", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    expect(pfgd.mode).toBe(PinMode.OUT);
    
    pfgd.mode = PinMode.IN;
    expect(pfgd.mode).toBe(PinMode.IN);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    expect(pfgd.mode).toBe(PinMode.IN);
    expect(pfgd.isPolling).toBeFalsy();

    pfgd.mode = PinMode.OUT;
    expect(pfgd.mode).toBe(PinMode.OUT);
    expect(pfgd.isPolling).toBeTruthy();

    pfgd.dispose();
    const disposedErr = new ObjectDisposedException("PiFaceGpioDigital");
    expect(() => { pfgd.mode = PinMode.IN }).toThrow(disposedErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );
    
    const uninitError = new IOException("Bus not initialized.");
    expect(() => { pfgd.mode = PinMode.IN }).toThrow(uninitError);
});

test("Can dispose", () => {
    const pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    expect(pfgd.isDisposed).toBeFalsy();
    
    pfgd.dispose();
    expect(pfgd.isDisposed).toBeTruthy();
});

test("Can change pin pull resistance", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    expect(pfgd.pullResistance).toBe(PinPullResistance.OFF);

    await pfgd.initialize();
    pfgd.pullResistance = PinPullResistance.PULL_DOWN;
    expect(pfgd.pullResistance).toBe(PinPullResistance.PULL_DOWN);

    pfgd.pullResistance = PinPullResistance.PULL_DOWN; // Do it again for coverage.
    expect(pfgd.pullResistance).toBe(PinPullResistance.PULL_DOWN);

    pfgd.pullResistance = PinPullResistance.PULL_UP;
    expect(pfgd.pullResistance).toBe(PinPullResistance.PULL_UP);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    pfgd.pullResistance = PinPullResistance.PULL_UP; // Do it again for coverage.
    expect(pfgd.pullResistance).toBe(PinPullResistance.PULL_UP);

    pfgd.pullResistance = PinPullResistance.PULL_DOWN;
    expect(pfgd.pullResistance).toBe(PinPullResistance.PULL_DOWN);

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    expect(() => { pfgd.pullResistance = PinPullResistance.PULL_UP }).toThrow(dispErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );
    
    const uninitErr = new IOException("Bus not initialized.");
    expect(() => { pfgd.pullResistance = PinPullResistance.PULL_DOWN }).toThrow(uninitErr);
});

test("Can get state", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    expect(pfgd.state).toBe(PinState.LOW);
    
    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    expect(pfgd.state).toBe(PinState.LOW);

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    expect(() => { const result = pfgd.state }).toThrow(dispErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    const uninitErr = new IOException("Bus not initialized.");
    expect(() => { const result = pfgd.state }).toThrow(uninitErr);
});

test("Can write pin", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    await pfgd.write(PinState.HIGH);
    expect(pfgd.state).toBe(PinState.HIGH);

    await pfgd.write(PinState.HIGH);  // Do it again for coverage.
    expect(pfgd.state).toBe(PinState.HIGH);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    await pfgd.write(PinState.HIGH);
    expect(pfgd.state).toBe(PinState.HIGH);

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    await expect(pfgd.write(PinState.HIGH)).rejects.toThrow(dispErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    const uninitErr = new IOException("Bus not initialized.");
    await expect(pfgd.write(PinState.HIGH)).rejects.toThrow(uninitErr);
});

test("Can start and cancel poll", async () => {
    const pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    expect(pfgd.isPolling).toBeFalsy();

    pfgd.poll();
    expect(pfgd.isPolling).toBeTruthy();

    pfgd.cancelPoll();
    expect(pfgd.isPolling).toBeFalsy();

    pfgd.cancelPoll();  // do it again for coverage.
    expect(pfgd.isPolling).toBeFalsy();
});

test("Can provision pin", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    await pfgd.provision();
    expect(pfgd.state).toBe(PinState.LOW);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.HIGH,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    await pfgd.provision();
    expect(pfgd.state).toBe(PinState.HIGH);

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    await expect(pfgd.provision()).rejects.toThrow(dispErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.HIGH,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    const uninitErr = new IOException("Bus not initialized.");
    await expect(pfgd.provision()).rejects.toThrow(uninitErr);
});

test("Can read pin", async () => {
    let pfgd = new PiFaceGpioDigital(
        PiFacePins.INPUT07,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    let result = await pfgd.read();
    expect(result).toBe(PinState.LOW);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    await pfgd.initialize();
    result = await pfgd.read();
    expect(result).toBe(PinState.LOW);

    pfgd.dispose();
    const dispErr = new ObjectDisposedException("PiFaceGpioDigital");
    await expect(pfgd.read()).rejects.toThrow(dispErr);

    pfgd = new PiFaceGpioDigital(
        PiFacePins.OUTPUT00,
        PinState.LOW,
        PiFaceGpioDigital.DEFAULT_ADDRESS,
        PiFaceGpioDigital.SPI_SPEED,
        true
    );

    const uninitErr = new IOException("Bus not initialized.");
    await expect(pfgd.read()).rejects.toThrow(uninitErr);
});