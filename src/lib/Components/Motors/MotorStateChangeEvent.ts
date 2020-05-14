import { MotorState } from './MotorState';

/**
 * @classdesc The event that gets raised when a motor changes state.
 */
export default class MotorStateChangeEvent {
  private mOldState: MotorState;
  private mNewState: MotorState;

  /**
   * Initializes a new instance of the [[MotorStateChangeEvent]]
   * class with the old and new state of the motor.
   * @param oldState The state the motor was in prior to the change.
   * @param newState The current state of the motor since the change.
   * @constructor
   */
  constructor(oldState: MotorState, newState: MotorState) {
    this.mOldState = oldState;
    this.mNewState = newState;
  }

  /**
   * Gets the state the motor was in prior to the change.
   */
  public get oldState() {
    return this.mOldState;
  }

  /**
   * Gets the new (current) state.
   * @readonly
   */
  public get newState() {
    return this.mNewState;
  }
}

/**
 * Motor state change event subscription.
 */
export interface IMotorStateChangeEventSubscription {
  /**
   * Removes the subscription.
   */
  remove: () => void;
}

/**
 * Motor state change event handler callback.
 */
export type MotorEventCallback = (evt: MotorStateChangeEvent) => void;
