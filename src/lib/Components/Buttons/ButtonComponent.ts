import InvalidOperationException from '../../InvalidOperationException';
import { PinMode, PinState } from '../../IO';
import IRaspiGpio from '../../IO/IRaspiGpio';
import PinStateChangeEvent, { IPinStateChangeEventSubscription } from '../../IO/PinStateChangeEvent';
import ObjectDisposedException from '../../ObjectDisposedException';
import ButtonBase from './ButtonBase';
import ButtonEvent from './ButtonEvent';
import { ButtonState } from './ButtonState';

const PRESSED_STATE = PinState.HIGH;
const RELEASED_STATE = PinState.LOW;

/**
 * A component that is an abstraction of a button. This is an
 * implementation of [[ButtonBase]].
 * @extends [[ButtonBase]]
 */
export default class ButtonComponent extends ButtonBase {
  private mPin: IRaspiGpio;
  private pinPolling: boolean;
  private pollTimer: NodeJS.Timeout | null;
  private pinEventSub?: IPinStateChangeEventSubscription;

  /**
   * Initializes a new instance of the [[ButtonComponent]] class
   * with the pin the button is attached to.
   * @param pin The input pin the button is wired to.
   * @param props Optional properties map.
   */
  constructor(pin: IRaspiGpio, props?: Map<string, any>) {
    super(props);
    this.mPin = pin;
    this.pinPolling = false;
    this.pollTimer = null;
    this.pinEventSub = this.mPin.addPinStateChangeListener(this.onPinStateChanged.bind(this));
  }

  /**
   * Gets the underlying pin the button is attached to.
   * @readonly
   */
  public get pin() {
    return this.mPin;
  }

  /**
   * Gets the button state.
   * @readonly
   * @override
   */
  public get state() {
    if (this.mPin.state === PRESSED_STATE) {
      return ButtonState.PRESSED;
    }

    return ButtonState.RELEASED;
  }

  /**
   * Checks to see if the button is in poll mode, where it reads the button
   * state every 500ms and fires state change events when the state changes.
   * @readonly
   */
  public get isPolling() {
    return this.pinPolling;
  }

  /**
   * Polls the button status.
   * @throws [[ObjectDisposedException]] if this instance has been disposed and
   * can no longer be used.
   * @throws [[InvalidOperationException]] if this button is attached to a pin
   * that has not been configured as an input.
   */
  public poll() {
    if (this.isPolling) {
      return;
    }

    if (this.isDisposed) {
      throw new ObjectDisposedException('ButtonComponent');
    }

    if (this.mPin.mode !== PinMode.IN) {
      throw new InvalidOperationException('The pin this button is attached to' + ' must be configured as an input.');
    }

    this.startPollTimer();
  }

  /**
   * Interrupts the poll cycle.
   */
  public interruptPoll() {
    if (!this.isPolling) {
      return;
    }

    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.pinPolling = false;
  }

  /**
   * Releases all resources used by the [[ButtonComponent]] object.
   * @override
   */
  public async dispose() {
    this.interruptPoll();
    if (this.pinEventSub) {
      this.pinEventSub.remove();
    }

    await this.mPin.dispose();
    await super.dispose();
  }

  private onPinStateChanged(psce: PinStateChangeEvent) {
    if (psce.newState !== psce.oldState) {
      super.onStateChanged(new ButtonEvent(this));
    }
  }

  private async executePoll() {
    if (this.isPolling) {
      await this.mPin.read();
    }
  }

  private startPollTimer() {
    this.pinPolling = true;
    this.pollTimer = setInterval(async () => {
      await this.executePoll();
    }, 500);
  }
}
