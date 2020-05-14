/**
 * @classdesc The event that gets raised when a motor rotation occurs.
 */
export default class MotorRotateEvent {
  private mSteps: number;

  /**
   * Initializes a new intance of the [[MotorRotateEvent]]
   * class with the number of steps being taken.
   * @param steps The steps being taken. 0 steps = stopped. Greater than
   * 0 = the number of steps forward. Less than 0 = the number of steps moving
   * backward.
   * @constructor
   */
  constructor(steps: number) {
    this.mSteps = steps;
  }

  /**
   * Gets the number of steps.
   * @readonly
   */
  public get steps() {
    return this.mSteps;
  }
}

/**
 * Motor rotate event subscription.
 */
export interface IMotorRotateEventSubscription {
  /**
   * Removes the event subscription.
   */
  remove: () => void;
}

/**
 * Motor rotate event handler callback.
 */
export type MotorRotateEventCallback = (evt: MotorRotateEvent) => void;

/**
 * Motor direction change event handler callback.
 */
export type MotorDirectionChangeEventCallback = () => void;
