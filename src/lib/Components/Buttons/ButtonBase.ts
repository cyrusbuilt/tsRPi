import ObjectDisposedException from '../../ObjectDisposedException';
import ComponentBase from '../ComponentBase';
import ButtonEvent, { ButtonStateChangeEventCallback, IButtonStateEventSubscription } from './ButtonEvent';
import { ButtonState } from './ButtonState';
import IButton, { ButtonEventTypes } from './IButton';

/**
 * @classdesc Base class for button device abstraction components.
 * @extends [[ComponentBase]]
 * @implements [[IButton]]
 */
export default abstract class ButtonBase extends ComponentBase implements IButton {
  private baseState: ButtonState;
  private holdTimer: NodeJS.Timeout | null;

  /**
   * Initializes a new instance of the [[ButtonBase]] class.
   * This is the default constructor.
   * @param props Optional properties map.
   */
  constructor(props?: Map<string, any>) {
    super(props);
    this.baseState = ButtonState.RELEASED;
    this.holdTimer = null;
  }

  /**
   * Gets the button state.
   * @readonly
   * @override
   */
  public get state() {
    return this.baseState;
  }

  /**
   * Gets a value indicating whether this instance is pressed.
   * @readonly
   * @override
   */
  public get isPressed() {
    return this.state === ButtonState.PRESSED;
  }

  /**
   * Gets a value indicating whether the button is released.
   * @readonly
   * @override
   */
  public get isReleased() {
    return this.state === ButtonState.RELEASED;
  }

  /**
   * Adds an event listener for the button state event.
   * @param listener The event handler callback.
   * @returns An event subscription object.
   * @throws [[ObjectDisposeException]] if this instance has been disposed.
   */
  public addButtonStateEventListener(listener: ButtonStateChangeEventCallback) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonBase');
    }

    const evt = this.on(ButtonEventTypes.STATE_CHANGED, listener);
    return {
      remove() {
        evt.removeListener(ButtonEventTypes.STATE_CHANGED, listener);
      },
    } as IButtonStateEventSubscription;
  }

  /**
   * Fires the button hold event.
   * @param btnEvent The event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onButtonHold(btnEvent: ButtonEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonBase');
    }

    this.emit(ButtonEventTypes.STATE_HOLD, btnEvent);
  }

  /**
   * Fires the button pressed event.
   * @param btnEvent The event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onButtonPressed(btnEvent: ButtonEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonBase');
    }

    this.emit(ButtonEventTypes.STATE_PRESSED, btnEvent);
    this.stopHoldTimer();
    this.startHoldTimer();
  }

  /**
   * Fires the button released event.
   * @param btnEvent The event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onButtonReleased(btnEvent: ButtonEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonBase');
    }

    this.emit(ButtonEventTypes.STATE_RELEASED, btnEvent);
  }

  /**
   * Fires the button state changed event.
   * @param btnEvent The event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onStateChanged(btnEvent: ButtonEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonBase');
    }

    this.emit(ButtonEventTypes.STATE_CHANGED, btnEvent);
    if (btnEvent.isPressed) {
      this.onButtonPressed(btnEvent);
    }

    if (btnEvent.isReleased) {
      this.onButtonReleased(btnEvent);
    }
  }

  /**
   * Checks to see if the button is in a state matching the specified state.
   * @param state The state to check.
   * @returns true if the button is in the specified state; Otherwise, false.
   * @override
   */
  public isState(state: ButtonState) {
    return this.state === state;
  }

  /**
   * Releases all resources used by the ButtonBase object.
   */
  public dispose() {
    if (this.isDisposed) {
      return;
    }

    this.removeAllListeners();
    this.stopHoldTimer();
    super.dispose();
  }

  /**
   * Timer elapsed callback. This fires the button hold event if the button is
   * pressed.
   * @param btnEvent The button event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  protected onHoldTimerElapsed(btnEvent: ButtonEvent) {
    if (this.isPressed) {
      this.onButtonHold(btnEvent);
    }
  }

  /**
   * Stops the button hold timer.
   */
  protected stopHoldTimer() {
    if (this.holdTimer !== null) {
      clearInterval(this.holdTimer);
      this.holdTimer = null;
    }
  }

  /**
   * Starts the button hold timer.
   */
  protected startHoldTimer() {
    this.holdTimer = setInterval(() => {
      this.onHoldTimerElapsed(new ButtonEvent(this));
    }, 2000);
  }

  /**
   * Sets the button state.
   * @param state The state to set.
   */
  protected setState(state: ButtonState) {
    this.baseState = state;
  }
}
