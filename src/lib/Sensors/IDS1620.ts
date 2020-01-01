import IDisposable from "../IDisposable";
import IGpio from "../IO/IGpio";

/**
 *  An interface for the Dallas Semiconductor DS1620 digital thermometer IC.
 * @interface
 * @extends [[IDisposable]]
 */
export default interface IDS1620 extends IDisposable {
    /**
     * In an implementing class, gets the clock pin.
     * @readonly
     */
    clockPin: IGpio;

    /**
     * In an implementing class, gets the data pin.
     * @readonly
     */
    dataPin: IGpio;

    /**
     * In an implementing class, gets the reset pin.
     * @readonly
     */
    resetPin: IGpio;

    /**
     * Initializes the sensor.
     */
    begin(): Promise<void>;

    /**
     * In an implementing class, sends the commands to get the temperature from the
     * sensor.
     * @returns The tempurature with half-degree granularity.
     * @throws [[ObjectDisposedException]] if the object instance has been disposed. 
     */
    getTemperature(): Promise<number>;
}