import ComponentBase from '../ComponentBase';
import IMotor, { MotorEventTypes } from './IMotor';
import { MotorState } from './MotorState';
import MotorStateChangeEvent, { MotorEventCallback, IMotorStateChangeEventSubscription } from './MotorStateChangeEvent';
import ObjectDisposedException from '../../ObjectDisposedException';
import { MotorDirectionChangeEventCallback } from './MotorRotateEvent';

/**
 * @classdesc Base class for motor abstraction components.
 * @extends [[ComponentBase]]
 * @implements [[IMotor]]
 */
export default abstract class MotorBase extends ComponentBase implements IMotor {
  protected mState: MotorState;

  /**
   * Initializes a new instance of the [[MotorBase]] class.
   * @param props A collection of component properties (optional).
   * @constructor
   */
  constructor(props?: Map<string, any>) {
    super(props);
    this.mState = MotorState.STOPPED;
  }

  /**
   * Internal method for setting the state.
   * @param state The state to set.
   */
  protected internalSetState(state: MotorState) {
    this.mState = state;
  }

  /**
   * Gets the state of the motor.
   * @readonly
   * @override
   */
  public get state() {
    return this.mState;
  }

  /**
   * Checks to see if the motor is stopped.
   * @readonly
   * @override
   */
  public get isStopped() {
    return this.isState(MotorState.STOPPED);
  }

  /**
   * Fires the motor state change event.
   * @param stateChangeEvent The event info object.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onMotorStateChanged(stateChangeEvent: MotorStateChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    this.emit(MotorEventTypes.STATE_CHANGED, stateChangeEvent);
    switch (stateChangeEvent.newState) {
      case MotorState.STOPPED:
        this.emit(MotorEventTypes.STOPPED);
        break;
      case MotorState.FORWARD:
        this.emit(MotorEventTypes.FORWARD);
        break;
      case MotorState.REVERSE:
        this.emit(MotorEventTypes.REVERSE);
        break;
    }
  }

  /**
   * Registers an event handler for the motor state change event.
   * @param handler The event info.
   * @returns The event subscription.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addMotorStateChangeEventListener(handler: MotorEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    const evt = this.on(MotorEventTypes.STATE_CHANGED, handler);
    return {
      remove() {
        evt.removeListener(MotorEventTypes.STATE_CHANGED, handler);
      },
    } as IMotorStateChangeEventSubscription;
  }

  /**
   * Registers an event handler for the motor stopped event.
   * @param handler The handler callback method.
   * @returns The event subscription.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addMotorStoppedEventHandler(handler: MotorDirectionChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    const evt = this.on(MotorEventTypes.STOPPED, handler);
    return {
      remove() {
        evt.removeListener(MotorEventTypes.STOPPED, handler);
      },
    } as IMotorStateChangeEventSubscription;
  }

  /**
   * Registers an event handler for the motor forward event.
   * @param handler The handler callback.
   * @retuns The event subscription.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addMotorForwardEventHandler(handler: MotorDirectionChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    const evt = this.on(MotorEventTypes.FORWARD, handler);
    return {
      remove() {
        evt.removeListener(MotorEventTypes.FORWARD, handler);
      },
    } as IMotorStateChangeEventSubscription;
  }

  /**
   * Registers an event handler for the motor reverse event.
   * @param handler The handler callback.
   * @returns The event subscription.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addMotorReverseEventHandler(handler: MotorDirectionChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    const evt = this.on(MotorEventTypes.REVERSE, handler);
    return {
      remove() {
        evt.removeListener(MotorEventTypes.REVERSE, handler);
      },
    } as IMotorStateChangeEventSubscription;
  }

  /**
   * Determines whether the motor's current state is the
   * specified state.
   * @param state The state to check for.
   * @returns true if the motor is in the specified state;
   * Otherwise, false.
   * @override
   */
  public isState(state: MotorState) {
    return this.state === state;
  }

  /**
   * Sets the motor state.
   * @param state The state to set.
   * @override
   */
  public abstract setState(state: MotorState): Promise<void>;

  /**
   * Stops the motor's movement.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async stop() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    if (this.isState(MotorState.STOPPED)) {
      return;
    }

    const oldState = this.state;
    await this.setState(MotorState.STOPPED);
    this.onMotorStateChanged(new MotorStateChangeEvent(oldState, MotorState.STOPPED));
  }

  /**
   * Tells the motor to move forward for the specified amount of time.
   * @param millis he number of milliseconds to continue moving forward
   * for. If zero, null, or undefined, then moves forward continuously until
   * stopped.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async forward(millis: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    if (this.isState(MotorState.FORWARD)) {
      return;
    }

    const oldState = this.state;
    await this.setState(MotorState.FORWARD);
    this.onMotorStateChanged(new MotorStateChangeEvent(oldState, MotorState.FORWARD));
    if (millis > 0) {
      setTimeout(async () => {
        await this.stop();
      }, millis);
    }
  }

  /**
   * Tells the motor to move in reverse for the specified amount of time.
   * @param millis The number of milliseconds to continue moving in
   * reverse for. If zero, null, or undefined, then moves in reverse continuously
   * until stopped.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async reverse(millis: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('MotorBase');
    }

    if (this.isState(MotorState.REVERSE)) {
      return;
    }

    const oldState = this.state;
    await this.setState(MotorState.REVERSE);
    this.onMotorStateChanged(new MotorStateChangeEvent(oldState, MotorState.REVERSE));
    if (millis > 0) {
      setTimeout(async () => {
        await this.stop();
      }, millis);
    }
  }
}
