import * as FS from 'fs';
import ExecUtils from '../ExecUtils';
import InvalidOperationException from '../InvalidOperationException';
import ObjectDisposedException from '../ObjectDisposedException';
import GpioBase from './GpioBase';
import { GpioPins } from './GpioPins';
import IOException from './IOException';
import { PinMode } from './PinMode';
import { PinState } from './PinState';
import PinStateChangeEvent from './PinStateChangeEvent';

/**
 * @classdesc Raspberry Pi GPIO using the file-based access method.
 * @extends [[GpioBase]]
 */
export default class GpioStandard extends GpioBase {
  /**
   * The path on the Raspberry Pi for the GPIO interface.
   * @const
   */
  public static readonly GPIO_PATH = '/sys/class/gpio/';

  /**
   * The array of export pins.
   * @const
   */
  public static readonly EXPORTED_PINS: GpioPins[] = [];

  private lastPinState: PinState;
  private isPwmPin: boolean;

  /**
   * Initalizes a new instance of the [[GpioStandard]] class with the pin the
   * GPIO is assigned to, the pin mode, and initial value.
   * @param pin The GPIO pin.
   * @param mode The I/O pin mode.
   * @param value The initial pin value.
   * @constructor
   * @override
   */
  constructor(pin: GpioPins | null, mode?: PinMode, value?: PinState) {
    super(pin, mode, value);

    this.lastPinState = PinState.LOW;
    this.isPwmPin = false;
    this.pwmRange = 1024;
  }

  /**
   * Gets or sets the PWM (Pulse-Width Modulation) value.
   * @property
   * @throws [[InvalidOperationException]] if the pin is not configured
   * as a PWM pin.
   * @override
   */
  public set pwm(value: number) {
    if (this.mode !== PinMode.PWM) {
      throw new InvalidOperationException('Cannot set PWM value on a pin not configured for PWM.');
    }

    if (value < 0) {
      value = 0;
    }

    if (value > 1023) {
      value = 1023;
    }

    if (this.pinPwm !== value) {
      this.pinPwm = value;
      let cmd: string = '';
      const cmds: Array<Promise<string[]>> = [];
      if (!this.isPwmPin) {
        // We may have to change mode first.
        cmd = `gpio mode ${GpioPins[this.innerPin]} pwm`;
        cmds.push(ExecUtils.executeCommand(cmd));
        this.isPwmPin = true;
      }

      cmd = `gpio pwm ${GpioPins[this.innerPin]} ${this.pinPwm.toString()}`;
      cmds.push(ExecUtils.executeCommand(cmd));
      Promise.all(cmds);
    }
  }

  public get pwm() {
    return this.pinPwm;
  }

  public set pwmRange(value: number) {
    if (value < 0) {
      value = 0;
    }

    if (value > 1024) {
      value = 1024;
    }

    if (this.pinPwmRange !== value) {
      this.pinPwmRange = value;
    }
  }

  /**
   * Gets or sets the PWM range.
   * @property
   * @override
   */
  public get pwmRange() {
    return this.pinPwmRange;
  }

  /**
   * Provisions the I/O pin. See http://wiringpi.com/reference/raspberry-pi-specifics/
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async provision() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioStandard');
    }

    await this.exportPin(this.innerPin, this.mode);
    return this.privWrite(this.innerPin, this.getInitialPinValue());
  }

  /**
   * Write a value to the pin.
   * @param ps The pin state value to write to the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @emits [[PinStateChangeEvent]] if the pin is changing state.
   * @override
   */
  public async write(ps: PinState) {
    await super.write(ps);
    await this.privWrite(this.innerPin, ps);
    if (this.lastPinState !== ps) {
      const psce = new PinStateChangeEvent(this.lastPinState, ps, this.innerPin);
      this.onPinStateChange(psce);
      this.lastPinState = ps;
    }
  }

  /**
   * Pulse the pin output for the specified number of milliseconds.
   * @param millis The number of milliseconds to wait between states.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[InvalidOperationException]] the this pin is not configured as
   * an input.
   * @emits [[PinStateChangeEvent]] as the pin changes state.
   * @override
   */
  public async pulse(millis: number = 500) {
    if (this.mode === PinMode.IN) {
      throw new InvalidOperationException('You cannot pulse a pin set as in input.');
    }

    await this.write(PinState.HIGH);
    await this.delay(millis);
    await this.write(PinState.LOW);
  }

  /**
   * Gets the value (state) of the pin.
   * @returns The pin state.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @emits [[PinStateChangeEvent]] if the pin has changed state since the
   * last read.
   * @override
   */
  public async read() {
    const val = await this.privRead(this.innerPin);
    if (this.lastPinState !== val) {
      this.onPinStateChange(new PinStateChangeEvent(this.lastPinState, val, this.innerPin));
      this.lastPinState = val;
    }

    return val;
  }

  /**
   * Performs application-defined tasks associated with freeing,
   * releasing, or resetting resources.
   * @override
   */
  public async dispose() {
    await this.unexportPin(this.innerPin);
    if (this.isPwmPin) {
        const cmd = `gpio unexport ${this.innerPin.valueOf()}`;
        await ExecUtils.executeCommand(cmd);
    }
    
    await this.write(PinState.LOW);
    super.dispose();
  }

  private async internalExportPin(pin: GpioPins, mode: PinMode, pinnum: string, pinname: string) {
    const pinPath = `${GpioStandard.GPIO_PATH}gpio${pinnum}`;
    const m = PinMode[mode];

    // If the pin is already exported, check it's in the proper direction.
    // If the direction matches, return out of the function. If not,
    // change the direction.
    if (GpioStandard.EXPORTED_PINS.includes(pin)) {
      if (this.mode !== mode) {
        FS.writeFileSync(`${pinPath}/direction`, m);
      }

      return;
    }

    if (!FS.existsSync(pinPath)) {
      FS.writeFileSync(`${GpioStandard.GPIO_PATH}export`, pinnum);
      GpioStandard.EXPORTED_PINS.push(pin);
    }

    FS.writeFileSync(`${pinPath}/direction`, m);
  }

  private async exportPin(pin: GpioPins, mode: PinMode) {
    return this.internalExportPin(pin, mode, pin.valueOf().toString(), GpioPins[pin]);
  }

  private async internalWrite(pin: GpioPins, value: PinState, pinnum: string, pinname: string) {
    if (pin === GpioPins.GPIO_NONE) {
      return;
    }

    await this.internalExportPin(pin, PinMode.OUT, pinnum, pinname);
    const val = PinState[value];
    const path = `${GpioStandard.GPIO_PATH}gpio${pinnum}/value`;
    FS.writeFileSync(path, val);
  }

  private async privWrite(pin: GpioPins, value: PinState) {
    const num = pin.valueOf().toString();
    const name = GpioPins[pin];
    return this.internalWrite(pin, value, num, name);
  }

  private async internalUnexportPin(pinnum: string) {
    FS.writeFileSync(`${GpioStandard.GPIO_PATH}unexport`, pinnum);
  }

  private async unexportPin(pin: GpioPins) {
    await this.privWrite(pin, PinState.LOW);
    return this.internalUnexportPin(pin.valueOf().toString());
  }

  private async internalRead(pin: GpioPins, pinnum: string, pinname: string) {
    await this.internalExportPin(pin, PinMode.IN, pinnum, pinname);

    let returnValue = PinState.LOW;
    const filename = `${GpioStandard.GPIO_PATH}gpio${pinnum}/value`;
    if (FS.existsSync(filename)) {
      const readValue = FS.readFileSync(filename).toString();
      if (readValue.length > 0 && parseInt(readValue.substring(0, 1), 0) === 1) {
        returnValue = PinState.HIGH;
      }
    } else {
      throw new IOException(`Cannot read from pin ${pinnum}. Device does not exist.`);
    }

    return returnValue;
  }

  private async privRead(pin: GpioPins) {
    const num = pin.valueOf().toString();
    const name = GpioPins[pin];
    return this.internalRead(pin, num, name);
  }
}
