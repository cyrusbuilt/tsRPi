import IComponent from '../IComponent';
import MotorStateChangeEvent from './MotorStateChangeEvent';
import { MotorState } from './MotorState';

/**
 * Motor event type names.
 */
export const MotorEventTypes = Object.freeze({
  /**
   * The name of the motor state change event.
   */
  STATE_CHANGED: 'motorStateChanged',

  /**
   * The name of the motor stopped event.
   */
  STOPPED: 'motorStopped',

  /**
   * The name of the motor forward movement event.
   */
  FORWARD: 'motorForward',

  /**
   * The name of the motor reverse movement event.
   */
  REVERSE: 'motorReverse',
});

/**
 * A motor abstraction interface.
 */
export default interface IMotor extends IComponent {
  /**
   * Gets the state of the motor.
   */
  readonly state: MotorState;

  /**
   * Checks to see if the motor is stopped.
   * @readonly
   */
  readonly isStopped: boolean;

  /**
   * Fires the motor state change event.
   * @param stateChangeEvent The event info object.
   */
  onMotorStateChanged(stateChangeEvent: MotorStateChangeEvent): void;

  /**
   * Tells the motor to move forward for the specified amount of time.
   * @param millis The number of milliseconds to continue moving forward
   * for. If zero, null, or undefined, then moves forward continuously until
   * stopped.
   */
  forward(millis: number): Promise<void>;

  /**
   * Tells the motor to move in reverse for the specified amount of time.
   * @param millis The number of milliseconds to continue moving in
   * reverse for. If zero, null, or undefined, then moves in reverse continuously
   * until stopped.
   */
  reverse(millis: number): Promise<void>;

  /**
   * Stops the motor's movement.
   */
  stop(): Promise<void>;

  /**
   * Determines whether the motor's current state is the
   * specified state.
   * @param state The state to check for.
   * @returns true if the motor is in the specified state;
   * Otherwise, false.
   */
  isState(state: MotorState): boolean;

  /**
   * Sets the motor state.
   * @param state The state to set.
   */
  setState(state: MotorState): Promise<void>;
}
