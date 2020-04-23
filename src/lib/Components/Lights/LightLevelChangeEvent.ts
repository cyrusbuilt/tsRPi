/**
 * @classdesc Light level change argument class.
 */
export default class LightLevelChangeEvent {
  private lightLevel: number;

  /**
   * Initializes a new instance of the [[LightLevelChangeEvent]] class with
   * the new light level value.
   * @param level The light level (0 - 100)
   * @constructor
   */
  constructor(level: number) {
    this.lightLevel = level;
  }

  /**
   * Gets the light level.
   * @readonly
   */
  public get level() {
    return this.lightLevel;
  }
}

/**
 * Light level change event listener.
 */
export interface ILightLevelChangeEventSubscription {
  /**
   * Removes the event listener.
   */
  remove: () => void;
}

/**
 * Light level change event listener callback.
 */
export type LightLevelChangeEventCallback = (lightLevelEvent: LightLevelChangeEvent) => void;
