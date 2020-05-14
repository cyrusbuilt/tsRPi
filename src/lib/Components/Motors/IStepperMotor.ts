import IMotor from './IMotor';
import MotorRotateEvent from './MotorRotateEvent';

/**
 * Stepper motor event names.
 */
export const StepperMotorEvents = Object.freeze({
  /**
   * The name of the motor rotation start event.
   */
  ROTATION_STARTED: 'stepperMotorRotationStarted',

  /**
   * The name of the motor rotation stop event.
   */
  ROTATION_STOPPED: 'stepperMotorRotationStopped',
});

/**
 * A stepper motor abstraction interface.
 * @extends [[IMotor]]
 */
export default interface IStepperMotor extends IMotor {
  /**
   * Gets or sets the number of steps per revolution.
   */
  stepsPerRevolution: number;

  /**
   * gets or sets an array of bytes representing the step sequence.
   */
  stepSequence: number[];

  /**
   * Fires the rotation start event.
   * @param event The event object.
   */
  onRotationStarted(event: MotorRotateEvent): void;

  /**
   * Fires the rotation stopped event.
   */
  onRotationStopped(): void;

  /**
   * Sets the step interval.
   * @param millis The milliseconds between steps.
   * @param nanos The nanoseconds between steps.
   */
  setStepInterval(millis: number, nanos: number): void;

  /**
   * Rotate the specified revolutions.
   * @param revolutions The number of revolutions to rotate.
   */
  rotate(revolutions: number): Promise<void>;

  /**
   * step the motor the specified steps.
   * @param steps The number of steps to rotate.
   */
  step(steps: number): Promise<void>;
}
