/**
 * @classdesc Provides core utility methods.
 */
export default class Coreutils {
  /**
   * Asynchronous sleep method. Allows delayed execution of a callback after the
   * specified time period in milliseconds using a Promise.
   * @param ms The time delay in milliseconds.
   */
  public static delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  /**
   * Asynchronous sleep method. Delays execution for the specified number of
   * microseconds.
   * @param micros The amount of time in microseconds to sleep.
   */
  public static async sleepMicroseconds(micros: number) {
    if (micros <= 0) {
      micros = 1;
    }

    const ms = micros / 1000;
    return Coreutils.delay(ms);
  }

  private constructor() {}
}
