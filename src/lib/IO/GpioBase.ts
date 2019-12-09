import * as EventEmitter from 'events';
import * as Util from 'util';
import { BoardRevision } from '../BoardRevision';
import ObjectDisposedException from '../ObjectDisposedException';
import { GpioPins } from './GpioPins';
import IRaspiGpio from './IRaspiGpio';
import { PinMode } from './PinMode';
import { PinState } from './PinState';
import PinStateChangeEvent, {
  IPinStateChangeEventSubscription,
  PinStateChangeEventCallback,
} from './PinStateChangeEvent';

/**
 * @classdesc Base class for the GPIO connector on the Raspberry Pi pin header.
 * @extends [[EventEmitter.EventEmitter]]
 * @implements [[IRaspiGpio]]
 */
export default class GpioBase extends EventEmitter.EventEmitter implements IRaspiGpio {
  /**
   * The pin state change event name.
   * @event
   */
  public static readonly EVENT_STATE_CHANGED = 'pinStateChanged';

  protected pinState: PinState;
  protected pinPwm: number;
  protected pinPwmRange: number;
  private pin: GpioPins;
  private pinMode: PinMode;
  private initValue: PinState;
  private disposed: boolean;
  private boardRevision: BoardRevision;
  private pinTag: any;

  /**
   * Initalizes a new instance of the [[GpioBase]] class with the pin the
   * GPIO is assigned to, the pin mode, and initial value.
   * @param pin The GPIO pin.
   * @param mode The I/O pin mode.
   * @param value The initial pin value.
   * @constructor
   */
  constructor(pin: GpioPins | null, mode?: PinMode, value?: PinState) {
    super();

    if (Util.isNullOrUndefined(pin)) {
      pin = GpioPins.GPIO_NONE;
    }

    this.pin = pin;
    if (Util.isNullOrUndefined(mode)) {
      mode = PinMode.OUT;
    }

    this.pinMode = mode;
    if (Util.isNullOrUndefined(value)) {
      value = PinState.LOW;
    }

    this.initValue = value;
    this.boardRevision = BoardRevision.Rev2;
    this.disposed = false;
    this.pinState = PinState.LOW;
    this.pinPwm = 0;
    this.pinPwmRange = 0;
    this.pinTag = null;
  }

  /**
   * Gets whether or not this instance has been disposed.
   * @property
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.disposed;
  }

  /**
   * Attaches a listener (callback) for the pin state change event.
   * @param listener The event listener to register.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addPinStateChangeListener(listener: PinStateChangeEventCallback): IPinStateChangeEventSubscription {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    const evt = this.on(GpioBase.EVENT_STATE_CHANGED, listener);
    return {
      remove() {
        evt.removeListener(GpioBase.EVENT_STATE_CHANGED, listener);
      },
    } as IPinStateChangeEventSubscription;
  }

  /**
   * Changes the default board revision.
   * @param revision The revision to set.
   */
  public changeBoardRevision(revision: BoardRevision) {
    this.boardRevision = revision;
  }

  /**
   * Notifies event listeners that the pin state has changed.
   * @param psce The pin state change event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onPinStateChange(psce: PinStateChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    this.emit(GpioBase.EVENT_STATE_CHANGED, psce);
  }

  /**
   * Gets the board revision.
   * @property
   * @readonly
   * @override
   */
  public get revision() {
    return this.boardRevision;
  }

  /**
   * Gets the pin state.
   * @property
   * @readonly
   * @override
   */
  public get state() {
    // TODO do a synchronous read first?
    return this.pinState;
  }

  /**
   * Gets the pin name.
   * @property
   * @readonly
   * @override
   */
  public get pinName() {
    return GpioPins[this.pin];
  }

  /**
   * Gets the physical pin being represented by this instance.
   * @property
   * @readonly
   * @override
   */
  public get innerPin() {
    return this.pin;
  }

  /**
   * Gets or sets the pin mode.
   * @property
   * @override
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public get mode() {
    return this.pinMode;
  }

  public set mode(value: PinMode) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    if (this.pinMode !== value) {
      this.pinMode = value;
    }
  }

  /**
   * Gets or sets the tag.
   * @property
   * @override
   */
  public get tag() {
    return this.pinTag;
  }

  public set tag(value: any) {
    this.pinTag = value;
  }

  /**
   * Gets or sets the PWM (Pulse-Width Modulation) value.
   * @property
   * @override
   */
  public get pwm() {
    return this.pinPwm;
  }

  public set pwm(value: number) {
    this.pinPwm = value;
  }

  /**
   * Gets or sets the PWM range.
   * @property
   * @override
   */
  public get pwmRange() {
    return this.pinPwmRange;
  }

  public set pwmRange(value: number) {
    this.pinPwmRange = value;
  }

  /**
   * Write a value to the pin.
   * @param ps The pin state value to write to the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async write(ps: PinState) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    this.pinState = ps;
  }

  /**
   * Gets the value (state) of the pin.
   * @returns The pin state.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async read() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    return this.pinState;
  }

  /**
   * Provisions the I/O pin. See http://wiringpi.com/reference/raspberry-pi-specifics/
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async provision() {
    return await this.write(this.initValue);
  }

  /**
   * Gets the pin address.
   * @property
   * @readonly
   */
  public get address() {
    return this.pin.valueOf();
  }

  /**
   * Pulse the pin output for the specified number of milliseconds.
   * @param millis The number of milliseconds to wait between states.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async pulse(millis: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioBase');
    }

    await this.write(PinState.HIGH);
    await this.delay(millis);
    await this.write(PinState.LOW);
  }

  /**
   * Gets the initial pin value (the value set in the constructor).
   * @returns The initial pin state value.
   */
  public getInitialPinValue() {
    return this.initValue;
  }

  /**
   * Performs application-defined tasks associated with freeing,
   * releasing, or resetting resources.
   * @override
   */
  public dispose() {
    if (this.isDisposed) {
      return;
    }

    this.removeAllListeners();
    this.pinState = PinState.LOW;
    this.pinMode = PinMode.TRI;
    this.initValue = PinState.LOW;
    this.disposed = true;
  }

  // TODO probably move this to coreutils/systemutils
  protected delay = (ms: number) => new Promise(res => setTimeout(res, ms));
}
