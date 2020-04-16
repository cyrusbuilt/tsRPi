import IComponent from '../IComponent';

/**
 * A piezo buzzer device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface IBuzzer extends IComponent {
  /**
   * starts the buzzer at the specified frequency and
   * (optionally) for the specified duration.
   * @param freq The frequency to buzz at.
   * @param duration The duration in milliseconds. If not specified,
   * buzzes until stopped.
   */
  buzz(freq: number, duration?: number): Promise<void>;

  /**
   * Stops the buzzer.
   */
  stop(): Promise<void>;
}
