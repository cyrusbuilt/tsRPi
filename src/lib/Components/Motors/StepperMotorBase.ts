import MotorBase from './MotorBase';
import IStepperMotor, { StepperMotorEvents } from './IStepperMotor';
import MotorRotateEvent, {
  MotorRotateEventCallback,
  IMotorRotateEventSubscription,
  MotorDirectionChangeEventCallback,
} from './MotorRotateEvent';
import ObjectDisposedException from '../../ObjectDisposedException';

/**
 * @classdesc A base class for stepper motor components.
 * @extends [[MotorBase]]
 * @implements [[IStepperMotor]]
 */
export default abstract class SteppMotorBase extends MotorBase implements IStepperMotor {
  /**
   * Gets or sets the number of steps per revolution.
   * @override
   */
  public stepsPerRevolution: number;

  /**
   * Gets or sets an array of bytes representing the step sequence.
   * @override
   */
  public stepSequence: number[];

  private mStepIntervalMillis: number;
  private mStepIntervalNanos: number;

  /**
   * Initializes a new instance of the [[StepperMotorBase]] class.
   * @param props A collection of component properties (optional).
   * @constructor
   */
  constructor(props?: Map<string, any>) {
    super(props);

    this.mStepIntervalMillis = 0;
    this.mStepIntervalNanos = 0;
    this.stepSequence = [];
    this.stepsPerRevolution = 0;
  }

  /**
   * Gets the step interval in milliseconds.
   * @readonly
   */
  public get stepIntervalMillis() {
    return this.mStepIntervalMillis;
  }

  /**
   * Gets the step interval in nanoseconds.
   * @readonly
   */
  public get stepIntervalNanos() {
    return this.mStepIntervalNanos;
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public dispose() {
    this.mStepIntervalMillis = 0;
    this.mStepIntervalNanos = 0;
    this.stepSequence = [];
    this.stepsPerRevolution = 0;
    super.dispose();
  }

  /**
   * Registers a listener for the rotation start event.
   * @param listener The handler callback for the rotation start event.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addRotationEventListener(listener: MotorRotateEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    const evt = this.on(StepperMotorEvents.ROTATION_STARTED, listener);
    return {
      remove() {
        evt.removeListener(StepperMotorEvents.ROTATION_STARTED, listener);
      },
    } as IMotorRotateEventSubscription;
  }

  /**
   * Registers a listener for the rotation stop event.
   * @param listener The handler callback for the rotation stop event.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addRotationStoppedEventListener(listener: MotorDirectionChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    const evt = this.on(StepperMotorEvents.ROTATION_STOPPED, listener);
    return {
      remove() {
        evt.removeListener(StepperMotorEvents.ROTATION_STOPPED, listener);
      },
    } as IMotorRotateEventSubscription;
  }

  /**
   * Fires the rotation start event.
   * @param rotateEvent The event object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onRotationStarted(rotateEvent: MotorRotateEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    this.emit(StepperMotorEvents.ROTATION_STARTED, rotateEvent);
  }

  /**
   * Fires the rotation stopped event.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onRotationStopped() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    this.emit(StepperMotorEvents.ROTATION_STOPPED);
  }

  /**
   * Sets the step interval.
   * @param millis The milliseconds between steps.
   * @param nanos The nanoseconds between steps.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public setStepInterval(millis: number, nanos: number = 0) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    this.mStepIntervalMillis = millis;
    this.mStepIntervalNanos = nanos;
  }

  /**
   * Step the motor the specified steps.
   * @param steps The number of steps to rotate.
   * @override
   */
  public abstract step(steps: number): Promise<void>;

  /**
   * Rotate the specified revolutions.
   * @param revolutions The number of revolutions to rotate.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async rotate(revolutions: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorBase');
    }

    const steps = Math.round(this.stepsPerRevolution * revolutions);
    const stepsActual = parseInt(steps.toString(), 10);
    this.onRotationStarted(new MotorRotateEvent(stepsActual));
    await this.step(stepsActual);
    this.onRotationStopped();
  }
}
