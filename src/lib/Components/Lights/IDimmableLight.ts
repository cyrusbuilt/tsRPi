import ILight from './ILight';
import LightLevelChangeEvent from './LightLevelChangeEvent';

/**
 * An interface for dimmable light component abstractions.
 * @extends [[ILight]]
 */
export default interface IDimmableLight extends ILight {
  /**
   * Gets the brightness level.
   */
  readonly level: number;

  /**
   * Gets the minimum brightness level.
   */
  readonly minLevel: number;

  /**
   * Gets the maximum brightness level.
   */
  readonly maxLevel: number;

  /**
   * Sets the brightness level.
   * @param level The brightness level.
   */
  setLevel(level: number): Promise<void>;

  /**
   * Raises the light level changed event.
   * @param levelChangedEvent The level change event object.
   */
  onLightLevelChanged(levelChangedEvent: LightLevelChangeEvent): void;

  /**
   * Gets the current brightness level percentage.
   * @param level The brightness level.
   * @returns The brightness percentage level.
   */
  getLevelPercentage(level: number): number;
}
