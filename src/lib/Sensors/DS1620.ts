import ObjectDisposedException from "../ObjectDisposedException";
import IGpio from "../IO/IGpio";
import { PinState } from "../IO";
import Coreutils from "../PiSystem/CoreUtils";
import IDS1620 from "./IDS1620";

/**
 * @classdesc This is a simple driver class for the Dallas Semiconductor DS1620
 * digital thermometer IC.
 * @implements [[IDS1620]]
 */
export default class DS1620 implements IDS1620 {
    /**
     * Gets the clock pin.
     * @readonly
     * @override
     */
    public readonly clockPin: IGpio;

    /**
     * Gets the data pin.
     * @readonly
     * @override
     */
    public readonly dataPin: IGpio;

    /**
     * Gets the reset pin.
     * @readonly
     * @override
     */
    public readonly resetPin: IGpio;

    private objDisposed: boolean;

    /**
     * Initializes a new instance of the DS1620 class with the pins
     * needed to acquire data.
     * @param clock The clock pin.
     * @param data The data pin.
     * @param reset The reset pin.
     * @constructor
     */
    constructor(clock: IGpio, data: IGpio, reset: IGpio) {
        this.clockPin = clock;
        this.dataPin = data;
        this.resetPin = reset;
        this.objDisposed = false;
    }

    /**
     * Determines whether or not this instance has been disposed.
     * @readonly
     * @override
     */
    public get isDisposed() {
        return this.objDisposed;
    }

    /**
     * Releases alll resources used by the DS1620 object.
     * @override
     */
    public async dispose() {
        if (this.isDisposed) {
            return;
        }

        await this.clockPin.dispose();
        await this.dataPin.dispose();
        await this.resetPin.dispose();
        this.objDisposed = true;
    }

    /**
     * Initializes the sensor.
     * @override
     */
    public async begin() {
        await this.clockPin.provision();
        await this.dataPin.provision();
        await this.resetPin.provision();
    }

    /**
     * Sends the commands to get the temperature from the sensor.
     * @returns The temperature with half-degree granularity.
     * @throws [[ObjectDisposedException]] if the object instance has been disposed.
     * @override
     */
    public async getTemperature() {
        if (this.isDisposed) {
            throw new ObjectDisposedException("DS1620");
        }

        await this.resetPin.write(PinState.LOW);
        await this.clockPin.write(PinState.HIGH);
        await this.resetPin.write(PinState.HIGH);
        await this.sendCommand(0x0c);  // Write config command
        await this.sendCommand(0x02);  // cpu mode
        await this.resetPin.write(PinState.LOW);

        // wait until the configuration register is written.
        await Coreutils.sleepMicroseconds(200000);

        await this.clockPin.write(PinState.HIGH);
        await this.resetPin.write(PinState.HIGH);
        await this.sendCommand(0xee);  // start conversion
        await this.resetPin.write(PinState.LOW);

        await Coreutils.sleepMicroseconds(200000);
        await this.clockPin.write(PinState.HIGH);
        await this.resetPin.write(PinState.HIGH);
        await this.sendCommand(0xaa);
        const raw = await this.readData();
        await this.resetPin.write(PinState.LOW);

        return (Number(raw.toFixed(2)) / 2.0);
    }

    /**
     * Sends an 8-bit command to the DS1620.
     * @param command The command to send.
     * @private
     */
    private async sendCommand(command: number) {
        for (let n = 0; n < 8; n++) {
            const bit = ((command >> n) & 0x01);
            await this.dataPin.write(bit === 1 ? PinState.HIGH : PinState.LOW);
            await this.clockPin.write(PinState.LOW);
            await this.clockPin.write(PinState.HIGH);
        }
    }

    /**
     * Reads 8-bit data from the DS1620.
     * @returns The temperature in half degree increments.
     * @private
     */
    private async readData() {
        let rawData = 0;
        for (let n = 0; n < 9; n++) {
            await this.clockPin.write(PinState.LOW);
            const bit = await this.dataPin.read();
            await this.clockPin.write(PinState.HIGH);
            rawData = rawData | (bit.valueOf() << n);
        }

        return rawData;
    }
}