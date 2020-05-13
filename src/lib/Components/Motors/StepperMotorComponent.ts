import SteppMotorBase from './StepperMotorBase';
import IGpio from '../../IO/IGpio';
import IllegalArgumentException from '../../IllegalArgumentException';
import ObjectDisposedException from '../../ObjectDisposedException';
import { PinState } from '../../IO';
import Coreutils from '../../PiSystem/CoreUtils';
import { MotorState } from './MotorState';
import MotorStateChangeEvent from './MotorStateChangeEvent';
import MotorRotateEvent from './MotorRotateEvent';

/**
 * @classdesc A component that is an abstraction of a stepper motor.
 * @extends [[StepperMotorBase]]
 */
export default class StepperMotorComponent extends SteppMotorBase {
  private sequenceIndex: number;
  private controlTimer: NodeJS.Timeout | null;
  private pins: IGpio[];

  /**
   * Initializes a new instance of the [[StepperMotorComponent]]
   * class with the pins used to control the stepper motor.
   * @param pins The output pins for each controller in the stepper motor.
   * This should be an array of Gpio (or derivative) objects.
   * @param props A collection of component properties (optional).
   * @constructor
   */
  constructor(pins: IGpio[], props?: Map<string, any>) {
    super(props);

    if (pins.length === 0) {
      throw new IllegalArgumentException('pins param cannot be an empty array');
    }

    this.sequenceIndex = 0;
    this.controlTimer = null;
    this.pins = pins;
  }

  /**
   * Initializes the motor by initializing all of the associated pins.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorComponent');
    }

    for (const pin of this.pins) {
      await pin.provision();
    }
  }

  /**
   * Sets the motor state and fires the state change event.
   * @param state The state to set.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async setState(state: MotorState) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorComponent');
    }

    const oldState = this.state;
    if (this.state !== state) {
      this.internalSetState(state);
      const evt = new MotorStateChangeEvent(oldState, state);
      this.onMotorStateChanged(evt);
      await this.executeMovement();
    }
  }

  /**
   * Stops the motor and fires the state change event.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async stop() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorComponent');
    }

    for (const pin of this.pins) {
      await pin.write(PinState.LOW);
    }

    await super.stop();
  }

  /**
   * Step the motor the specified steps.
   * @param steps The number of steps to rotate.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async step(steps: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('StepperMotorComponent');
    }

    if (steps === 0) {
      await this.setState(MotorState.STOPPED);
      return;
    }

    // Perform step in positive or negative direction from current position.
    const evt = new MotorRotateEvent(steps);
    this.onRotationStarted(evt);
    let totalSteps = steps;
    if (steps < 0) {
        totalSteps = 2 * -steps;
    }

    for (let i = 0; i < totalSteps; i++) {
      await this.doStep(steps > 0);
    }

    // Stop movement.
    await this.stop();
    this.onRotationStopped();
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    this.killTimer();
    await this.setState(MotorState.STOPPED);
    this.sequenceIndex = 0;
    if (this.pins.length > 0) {
      for (const pin of this.pins) {
        await pin.write(PinState.LOW);
        await pin.dispose();
      }
    }

    super.dispose();
  }

  private killTimer() {
    if (this.controlTimer !== null) {
      clearInterval(this.controlTimer);
      this.controlTimer = null;
    }
  }

  private async doStep(forward: boolean) {
    if (forward) {
      this.sequenceIndex++;
    } else {
      this.sequenceIndex--;
    }

    // Check sequence bounds; rollover if needed.
    const seq = this.stepSequence;
    if (this.sequenceIndex >= seq.length) {
      this.sequenceIndex = 0;
    } else if (this.sequenceIndex < 0) {
      this.sequenceIndex = seq.length - 1;
    }

    // Start cycling through GPIO pins to move the motor forward or reverse.
    let nib = 0;
    for (let i = 0; i < this.pins.length; i++) {
      nib = Math.pow(2, i);
      if ((seq[this.sequenceIndex] & parseInt(nib.toString(), 10)) > 0) {
        await this.pins[i].write(PinState.HIGH);
      } else {
        await this.pins[i].write(PinState.LOW);
      }
    }

    const millis = this.stepIntervalMillis;
    const nanos = this.stepIntervalNanos;
    const waitTime = millis + (nanos * 1000000);
    if (waitTime > 0) {
        //console.log("Sleep time = " + waitTime);
        //await Coreutils.sleepMicroseconds(waitTime);
        // TODO any amount of wait time causes the callback to take too long.
        // Which causes jest to fail. Need to understand what is causing the
        // timeout. Maybe we don't need this delay??
    }
  }

  private async doMovement() {
    if (this.state !== MotorState.STOPPED) {
      await this.doStep(this.state === MotorState.FORWARD);
    }
  }

  private async executeMovement() {
    if (this.state === MotorState.STOPPED) {
      for (const pin of this.pins) {
        await pin.write(PinState.LOW);
      }

      this.killTimer();
      return;
    }

    this.controlTimer = setInterval(async () => {
      await this.doMovement();
    }, 10);
  }
}
