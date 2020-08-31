import IComponent from '../IComponent';

/**
 * A digital potentiometer device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface IPotentiometer extends IComponent {
  /**
   * Gets the maximum wiper-value supported by the device.
   * @readonly
   */
  readonly maxValue: number;

  /**
   * Gets whether the device is a potentiometer or a rheostat.
   * @readonly
   */
  readonly isRheostat: boolean;

  /**
   * Gets or sets the wiper's current value.
   */
  currentValue: number;

  /**
   * Increases the wiper's value by the specified number of steps.
   * It is not an error if the wiper hits or already hit the upper
   * boundary. In such situations, the wiper sticks to the upper
   * boundary or doesn't change.
   * @param steps How many steps to increase. If not specified
   * or zero then defaults to 1. If the current value is equal to the max
   * value, then nothing happens. If steps is less than zero, than an
   * exception is thrown.
   */
  increase(steps: number): Promise<void>;

  /**
   * Decreases the wiper's value by the specified number of
   * steps. It is not an error if the wiper hits or already
   * hit the lower boundary (0). In such situations, the
   * wiper sticks to the lower boundary or doesn't change.
   * @param steps The number of steps to decrease by. If not
   * specified or zero, then defaults to 1.
   */
  decrease(steps: number): Promise<void>;
}
