import { EventEmitter } from "events";
import * as Util from 'util';
import ObjectDisposedException from '../ObjectDisposedException';
import IPiFaceGPIO from "./IPiFaceGPIO";
import { PiFacePins } from "./PiFacePins";
import { PinMode } from "./PinMode";
import { PinState } from "./PinState";
import PinStateChangeEvent, {
    IPinStateChangeEventSubscription,
    PinStateChangeEventCallback
} from './PinStateChangeEvent';

/**
 * @classdesc Base class for the GPIO pins on the PiFace.
 * @extends [[EventEmitter.EventEmitter]]
 * @implements [[IPiFaceGPIO]]
 */
export default abstract class PiFaceGpioBase extends EventEmitter.EventEmitter implements IPiFaceGPIO {
    /**
     * The pin state change event name.
     * @event
     */
    public static readonly EVENT_STATE_CHANGED = "piFaceGpioStateChanged";

    /**
     * An array of all PiFace outputs.
     * @constant
     */
    public static readonly OUTPUTS: PiFacePins[] = [
        PiFacePins.OUTPUT00,
        PiFacePins.OUTPUT01,
        PiFacePins.OUTPUT02,
        PiFacePins.OUTPUT03,
        PiFacePins.OUTPUT04,
        PiFacePins.OUTPUT05,
        PiFacePins.OUTPUT06,
        PiFacePins.OUTPUT07
    ];

    /**
     * An array of all PiFace inputs.
     * @constant
     */
    public static readonly INPUTS: PiFacePins[] = [
        PiFacePins.INPUT00,
        PiFacePins.INPUT01,
        PiFacePins.INPUT02,
        PiFacePins.INPUT03,
        PiFacePins.INPUT04,
        PiFacePins.INPUT05,
        PiFacePins.INPUT06,
        PiFacePins.INPUT07
    ];

    /**
     * Gets the pin name.
     * @property
     * @readonly
     * @override
     */
    public readonly pinName: string;

    /**
     * Gets or sets the tag.
     * @property
     * @override
     */
    public tag: any;

    protected pinState: PinState;
    protected pinPwm: number;
    protected pinPwmRange: number;
    protected pinMode: PinMode;
    private isPinDisposed: boolean;
    private pin: PiFacePins;
    private initPinValue: PinState;

    /**
     * Initializes a new instance of the [[PiFaceGpioBase]] class with the
     * pin the GPIO is assigned to, the initial state of the pin, and pin name.
     * @param pin The physical pin being wrapped by this class.
     * @param initialValue The initial value of the pin.
     * @param name The pin name.
     * @constructor
     */
    constructor(pin: PiFacePins | null, initialValue: PinState = PinState.LOW, name?: string) {
        super();

        this.isPinDisposed = false;
        this.pin = pin || PiFacePins.NONE;
        this.pinName = name || PiFacePins[this.pin];
        this.pinPwm = 0;
        this.pinPwmRange = 0;
        this.initPinValue = initialValue;
        this.pinState = this.initPinValue;
        this.pinMode = PinMode.TRI;

        switch (this.pin) {
            case PiFacePins.INPUT00:
            case PiFacePins.INPUT01:
            case PiFacePins.INPUT02:
            case PiFacePins.INPUT03:
            case PiFacePins.INPUT04:
            case PiFacePins.INPUT05:
            case PiFacePins.INPUT06:
            case PiFacePins.INPUT07:
                this.pinMode = PinMode.IN;
                break;
            case PiFacePins.OUTPUT00:
            case PiFacePins.OUTPUT01:
            case PiFacePins.OUTPUT02:
            case PiFacePins.OUTPUT03:
            case PiFacePins.OUTPUT04:
            case PiFacePins.OUTPUT05:
            case PiFacePins.OUTPUT06:
            case PiFacePins.OUTPUT07:
                this.pinMode = PinMode.OUT;
                break;
            case PiFacePins.NONE:
            default:
                break;
        }
    }

    /**
     * Gets whether or not this instance has been disposed.
     * @property
     * @readonly
     * @override
     */
    public get isDisposed() {
        return this.isPinDisposed;
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
     * Gets the state of the pin.
     * @property
     * @readonly
     * @throws [[ObjectDisposedException]] if this instance has been disposed.
     * @override
     */
    public get state() {
        // TODO do synchronous read here first?
        return this.pinState;
    }

    /**
     * Gets or sets the pin mode.
     * @property
     * @throws [[ObjectDisposedException]] if this instance has been disposed.
     * @override
     */
    public get mode() {
        return this.pinMode;
    }

    public set mode(value: PinMode) {
        if (this.isDisposed) {
            throw new ObjectDisposedException("PiFaceGpioBase");
        }

        if (this.pinMode !== value) {
            this.pinMode = value;
            // If we changing modes, then we need to re-provision.
            this.provision();
        }
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
     * Gets the pin address.
     * @property
     * @readonly
     * @override
     */
    public get address() {
        return this.innerPin.valueOf();
    }

    /**
     * Releases all resources used by the PiFaceGpioBase object.
     * @override
     */
    public dispose() {
        if (this.isDisposed) {
            return;
        }

        this.removeAllListeners();
        this.pin = PiFacePins.NONE;
        this.pinMode = PinMode.TRI;
        this.tag = undefined;
        this.isPinDisposed = true;
    }

  /**
   * Attaches a listener (callback) for the pin state change event.
   * @param listener The event listener to register.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   */
  public addPinStateChangeListener(listener: PinStateChangeEventCallback): IPinStateChangeEventSubscription {
    if (this.isDisposed) {
        throw new ObjectDisposedException('PiFaceGpioBase');
    }

    const evt = this.on(PiFaceGpioBase.EVENT_STATE_CHANGED, listener);
    return {
        remove() {
          evt.removeListener(PiFaceGpioBase.EVENT_STATE_CHANGED, listener);
        }
    } as IPinStateChangeEventSubscription;
  }

  /**
   * Notifies event listeners that the pin state has changed.
   * @param psce The pin state change event info.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public onPinStateChange(psce: PinStateChangeEvent) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioBase');
    }

    this.emit(PiFaceGpioBase.EVENT_STATE_CHANGED, psce);
  }

  public abstract provision(): Promise<void>;

  public abstract read(): Promise<PinState>;

  /**
   * Write a value to the pin.
   * @param value The pin state value to write to the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   * @async
   */
  public async write(value: PinState) {
      if (this.isDisposed) {
          throw new ObjectDisposedException("PiFaceGpioBase");
      }

      this.pinState = value;
  }

  /**
   * Pulse the pin output for the specified number of milliseconds.
   * @param millis The number of milliseconds to wait between states.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   * @async
   */
  public async pulse(millis: number) {
    if (this.isDisposed) {
        throw new ObjectDisposedException("PiFaceGpioBase");
    }

    await this.write(PinState.HIGH);
    await this.delay(millis);
    await this.write(PinState.LOW);
  }

  // TODO probably move this to coreutils/systemutils
  protected delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  /**
   * Gets the GPIO pin number in string format.
   * @param pin The GPIO pin.
   * @returns The GPIO pin number as string.
   * @protected
   */
  protected getGpioPinNumber(pin: PiFacePins) {
    return pin.valueOf().toString();
  }
}