/**
 * @classdesc Light state change event arguments class.
 */
export default class LightStateChangeEvent {
  private on: boolean;

  /**
   * Initializes a new instance of the [[LightStateChangeEvent]] class with
   * a flag indicating whether or not the light is on.
   * @param isOn Set true if the light is on; false if it is not.
   * @constructor
   */
  constructor(isOn: boolean) {
    this.on = isOn;
  }

  /**
   * Gets whether or not the light is on.
   * @readonly
   */
  public get isOn() {
    return this.on;
  }
}

/**
 * Light state change event listener.
 */
export interface ILightStateChangeSubscription {
  /**
   * Removes the event listener.
   */
  remove: () => void;
}

/**
 * Light state change event listener callback.
 */
export type LightStateChangeCallback = (lightStateEvent: LightStateChangeEvent) => void;
