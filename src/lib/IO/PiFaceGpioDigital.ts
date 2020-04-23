import * as FS from 'fs';
import * as Process from 'process';
import * as Util from 'util';
import ObjectDisposedException from '../ObjectDisposedException';
import IOException from './IOException';
import PiFaceGpioBase from './PiFaceGpioBase';
import { PiFacePins } from './PiFacePins';
import { PinMode } from './PinMode';
import { PinPullResistance } from './PinPullResistance';
import { PinState } from './PinState';
import PinStateChangeEvent from './PinStateChangeEvent';
import SpiBusFactory, { ISpiBus } from './SPI/SpiBus';

const REGISTER_IODIR_A = 0x00;
const REGISTER_IODIR_B = 0x01;
const REGISTER_GPINTEN_A = 0x04;
const REGISTER_GPINTEN_B = 0x05;
const REGISTER_DEFVAL_A = 0x06;
const REGISTER_DEFVAL_B = 0x07;
const REGISTER_INTCON_A = 0x08;
const REGISTER_INTCON_B = 0x09;
const REGISTER_IOCON_A = 0x0a;
const REGISTER_IOCON_B = 0x0b;
const REGISTER_GPPU_A = 0x0c;
const REGISTER_GPPU_B = 0x0d;
const REGISTER_INTF_A = 0x0e;
const REGISTER_INTF_B = 0x0f;
const REGISTER_INTCAP_A = 0x10;
const REGISTER_INTCAP_B = 0x11;
const REGISTER_GPIO_A = 0x12;
const REGISTER_GPIO_B = 0x13;

const GPIO_A_OFFSET = 0;
const GPIO_B_OFFSET = 1000;

const IOCON_UNUSED = 0x01;
const IOCON_INTPOL = 0x02;
const IOCON_ODR = 0x04;
const IOCON_HAEN = 0x08;
const IOCON_DISSLW = 0x10;
const IOCON_SEQOP = 0x20;
const IOCON_MIRROR = 0x40;
const IOCON_BANK_MODE = 0x80;

const defaultBusPath = '/dev/spidev0.0';
const stubDevice = Process.platform === 'win32' ? '\\\\.\\NUL' : '/dev/null';
const busPath = FS.existsSync(defaultBusPath) ? defaultBusPath : stubDevice;

/**
 * @classdesc PiFace GPIO pin implementing SPI.
 * @extends [[PiFaceGpioBase]]
 */
export default class PiFaceGpioDigital extends PiFaceGpioBase {
  /**
   * SPI Bus address 0.
   * @const
   */
  public static readonly ADDRESS_0 = 0x01000000; // 0x40 [0100 0000]

  /**
   * SPI Bus address 1.
   * @const
   */
  public static readonly ADDRESS_1 = 0x01000010; // 0x42 [0100 0010]

  /**
   * SPI Bus address 2.
   * @const
   */
  public static readonly ADDRESS_2 = 0x01000100; // 0x44 [0100 0100]

  /**
   * SPI Bus address 3.
   * @const
   */
  public static readonly ADDRESS_3 = 0x01000110; // 0x46 [0100 0110]

  /**
   * Default SPI Bus address.
   * @const
   */
  public static readonly DEFAULT_ADDRESS = PiFaceGpioDigital.ADDRESS_0;

  /**
   * Default SPI bus clock speed (1MHz).
   * @const
   */
  public static readonly SPI_SPEED = 1000000;

  /**
   * Bus write flag.
   * @const
   */
  public static readonly WRITE_FLAG = 0x00;

  /**
   * Bus read flag.
   * @const
   */
  public static readonly READ_FLAG = 0x01;

  private busSpeed: number;
  private spi: ISpiBus;
  private busAddress: number;
  private currentStatesA: number;
  private currentStatesB: number;
  private currentDirectionA: number;
  private currentDirectionB: number;
  private currentPullupA: number;
  private currentPullupB: number;
  private oldState: PinState;
  private initValue: PinState;
  private shuttingDown: boolean;
  private initialized: boolean;
  private pinPullResistance: PinPullResistance;
  private pollTimer: NodeJS.Timeout | null;
  private spiBusPath: string;

  /**
   * Initializes a new instance of the jsrpi.IO.PiFaceGpioDigital class with
   * the pin to control, initial pin state, SPI address, and SPI speed.
   * @param pin The PiFace pin to control.
   * @param initialValue The initial value (state) to set the pin to.
   * Default is [[PinState.LOW]].
   * @param spiAddress The SPI address to use. (Should be ADDRESS_0,
   * ADDRESS_1, ADDRESS_2, or ADDRESS_3).
   * @param spiSpeed The clock speed to set the bus to. Can be powers
   * of 2 (500KHz minimum up to 32MHz maximum). If not specified, the default of
   * SPI_SPEED (1MHz) will be used.
   * @constructor
   */
  constructor(
    pin: PiFacePins | null,
    initialValue: PinState = PinState.LOW,
    spiAddress?: number,
    spiSpeed?: number,
    test?: boolean,
  ) {
    super(pin, initialValue);

    this.busSpeed = spiSpeed || PiFaceGpioDigital.SPI_SPEED;
    this.spi = SpiBusFactory.create(busPath, test);
    this.spi.clockSpeed(this.busSpeed);
    this.spiBusPath = busPath;
    this.busAddress = spiAddress || PiFaceGpioDigital.DEFAULT_ADDRESS;
    this.currentStatesA = 0x00000000;
    this.currentStatesB = 0x11111111;
    this.currentDirectionA = 0x00000000;
    this.currentDirectionB = 0x11111111;
    this.currentPullupA = 0x00000000;
    this.currentPullupB = 0x11111111;
    this.oldState = PinState.LOW;
    this.shuttingDown = false;
    this.pinPullResistance = PinPullResistance.OFF;
    this.initValue = initialValue;
    this.initialized = false;
    this.pollTimer = null;
  }

  /**
   * Gets whether or not a pin state polling is active.
   * @property
   * @readonly
   */
  public get isPolling() {
    return this.pollTimer !== null;
  }

  /**
   * Gets or sets the pin mode.
   * @property
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the SPI port if bus is
   * uninitialized.
   * @override
   */
  public get mode() {
    return this.pinMode;
  }

  public set mode(value: PinMode) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    this.pinMode = value;
    if (this.innerPin.valueOf() < GPIO_B_OFFSET) {
      this.setModeA(value);
    } else {
      this.setModeB(value);
    }

    if (this.currentDirectionA > 0 || this.currentDirectionB > 0) {
      this.poll();
    } else {
      this.cancelPoll();
    }
  }

  /**
   * Gets or sets the pin pull-up/down resistance.
   * @property
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the SPI port if bus is
   * uninitialized.
   * @override
   */
  public get pullResistance() {
    return this.pinPullResistance;
  }

  public set pullResistance(value: PinPullResistance) {
    if (this.pinPullResistance === value) {
      return;
    }

    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    this.pinPullResistance = value;
    if (this.innerPin.valueOf() < GPIO_B_OFFSET) {
      this.setPullResistanceA(value);
    } else {
      this.setPullResistanceB(value);
    }
  }

  /**
   * Gets the state of the pin.
   * @property
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read the SPI port if bus is
   * uninitialized.
   * @readonly
   * @override
   */
  public get state() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    let result = this.pinState;
    if (this.innerPin.valueOf() < GPIO_B_OFFSET) {
      result = this.getStateA();
    } else {
      result = this.getStateB();
    }

    return result;
  }

  /**
   * Configures and initializes the I/O expander on the PiFace. This MUST be
   * called before performining any other operations.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read or write the SPI port.
   */
  public async initialize() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    // IOCON – I/O EXPANDER CONFIGURATION REGISTER
    //
    // bit 7 BANK: Controls how the registers are addressed
    //     1 = The registers associated with each port are separated into different banks
    //     0 = The registers are in the same bank (addresses are sequential)
    // bit 6 MIRROR: INT Pins Mirror bit
    //     1 = The INT pins are internally connected
    //     0 = The INT pins are not connected. INTA is associated with PortA and INTB is associated with PortB
    // bit 5 SEQOP: Sequential Operation mode bit.
    //     1 = Sequential operation disabled, address pointer does not increment.
    //     0 = Sequential operation enabled, address pointer increments.
    // bit 4 DISSLW: Slew Rate control bit for SDA output.
    //     1 = Slew rate disabled.
    //     0 = Slew rate enabled.
    // bit 3 HAEN: Hardware Address Enable bit (MCP23S17 only).
    //     Address pins are always enabled on MCP23017.
    //     1 = Enables the MCP23S17 address pins.
    //     0 = Disables the MCP23S17 address pins.
    // bit 2 ODR: This bit configures the INT pin as an open-drain output.
    //     1 = Open-drain output (overrides the INTPOL bit).
    //     0 = Active driver output (INTPOL bit sets the polarity).
    // bit 1 INTPOL: This bit sets the polarity of the INT output pin.
    //     1 = Active-high.
    //     0 = Active-low.
    // bit 0 Unimplemented: Read as ‘0’.
    //

    // write IO configuration (enable hardware address)
    await this.privWrite(REGISTER_IOCON_A, IOCON_SEQOP | IOCON_HAEN);
    await this.privWrite(REGISTER_IOCON_B, IOCON_SEQOP | IOCON_HAEN);

    // read initial GPIO pin states
    this.currentStatesA = await this.privRead(REGISTER_GPIO_A);
    this.currentStatesB = await this.privRead(REGISTER_GPIO_B);

    // set all default pin pull up resistors
    // (1 = Pull-up enabled.)
    // (0 = Pull-up disabled.)
    await this.privWrite(REGISTER_IODIR_A, this.currentDirectionA);
    await this.privWrite(REGISTER_IODIR_B, this.currentDirectionB);

    // set all default pin states
    await this.privWrite(REGISTER_GPIO_A, this.currentStatesA);
    await this.privWrite(REGISTER_GPIO_B, this.currentStatesB);

    // set all default pin pull up resistors
    // (1 = Pull-up enabled.)
    // (0 = Pull-up disabled.)
    await this.privWrite(REGISTER_GPPU_A, this.currentPullupA);
    await this.privWrite(REGISTER_GPPU_B, this.currentPullupB);

    // set all default pin interrupts
    // (if pin direction is input (1), then enable interrupt for pin)
    // (1 = Enable GPIO input pin for interrupt-on-change event.)
    // (0 = Disable GPIO input pin for interrupt-on-change event.)
    await this.privWrite(REGISTER_GPINTEN_A, this.currentDirectionA);
    await this.privWrite(REGISTER_GPINTEN_B, this.currentDirectionB);

    // set all default pin interrupt default values
    // (comparison value registers are not used in this implementation)
    await this.privWrite(REGISTER_DEFVAL_A, 0x00);
    await this.privWrite(REGISTER_DEFVAL_B, 0x00);

    // set all default pin interrupt comparison behaviors
    // (1 = Controls how the associated pin value is compared for interrupt-on-change.)
    // (0 = Pin value is compared against the previous pin value.)
    await this.privWrite(REGISTER_INTCON_A, 0x00);
    await this.privWrite(REGISTER_INTCON_B, 0x00);

    // reset/clear interrupt flags
    if (this.currentDirectionA > 0) {
      await this.privRead(REGISTER_INTCAP_A);
    }

    if (this.currentDirectionB > 0) {
      await this.privRead(REGISTER_INTCAP_B);
    }

    this.initialized = true;
  }

  /**
   * Writes the specified state to the pin (set state).
   * @param state The state to set.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the SPI port.
   * @override
   */
  public async write(state: PinState) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    return this.setState(state);
  }

  /**
   * Cancels an input poll cycle (if running) started by poll() or setMode().
   * @override
   */
  public cancelPoll() {
    if (this.shuttingDown) {
      return;
    }

    this.shuttingDown = true;
    if (!Util.isNullOrUndefined(this.pollTimer)) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Starts a pin poll cycle. This will monitor the pin and check for state
   * changes. If a state change is detected, the PiFaceGpioDigital.EVENT_STATE_CHANGED
   * event will be emitted. The poll cycle runs asynchronously until stopped by the
   * cancelPoll() method or when this object instance is disposed.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if the bus is not yet initialized.
   * @override
   */
  public poll() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    this.shuttingDown = false;
    this.pollTimer = setInterval(() => {
      this.backgroundPoll();
    }, 50);
  }

  /**
   * Provisions the I/O pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to write to the SPI port.
   * @override
   */
  public async provision() {
    return this.write(this.initValue);
  }

  /**
   * Reads a value from the pin.
   * @returns A single byte read from the pin.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @throws [[IOException]] if unable to read from the SPI port.
   * @override
   */
  public async read() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('PiFaceGpioDigital');
    }

    if (!this.initialized) {
      throw new IOException('Bus not initialized.');
    }

    if (this.innerPin.valueOf() < GPIO_B_OFFSET) {
      return this.privRead(REGISTER_GPIO_A);
    }

    return this.privRead(REGISTER_GPIO_B);
  }

  /**
   * Releases all resources used by the PiFaceGpioDigital object.
   * @override
   */
  public dispose() {
    if (this.isDisposed) {
      return;
    }

    this.cancelPoll();
    this.spi.close((err) => {
      console.log(err);
    });
    super.dispose();
  }

  private async privWrite(register: number, data: number) {
    const packet = new Array<number>(3);
    packet[0] = this.busAddress | PiFaceGpioDigital.WRITE_FLAG; // Address byte
    packet[1] = register; // register byte
    packet[2] = data; // data byte

    try {
      const writeFunc = Util.promisify(this.spi.write).bind(this.spi);
      await writeFunc(Buffer.from(packet));
    } catch (err) {
      if (err.message !== 'no error') {
        let errMsg = `Failed to write to SPI bus device at address ${this.busAddress} on channel`;
        errMsg = `${errMsg} ${this.spiBusPath} Error: ${err}`;
        throw new IOException(errMsg);
      }
    }
  }

  private async privRead(register: number) {
    const packet = new Array<number>(3);
    packet[0] = this.busAddress | PiFaceGpioDigital.READ_FLAG;
    packet[1] = register;
    packet[2] = 0x00000000;

    let result = 0;
    try {
      const transferFunc = Util.promisify(this.spi.transfer).bind(this.spi);
      const res = await transferFunc(Buffer.from(packet));
      const buf = res as Buffer;
      result = buf[2] & 0xff;
    } catch (err) {
      if (err.message !== 'no error') {
        let errMsg = `Failed to write to SPI bus device at address ${this.busAddress} on channel`;
        errMsg = `${errMsg} ${this.spiBusPath} Error: ${err}`;
        throw new IOException(errMsg);
      }
    }

    return result;
  }

  private async setStateA(state: PinState) {
    // determine pin address.
    const pinAddress = this.innerPin.valueOf() - GPIO_A_OFFSET;

    // determine state value for pin bit
    if (state === PinState.HIGH) {
      this.currentStatesA |= pinAddress;
    } else {
      this.currentStatesA &= ~pinAddress;
    }

    // update state value.
    return this.privWrite(REGISTER_GPIO_A, this.currentStatesA);
  }

  private async setStateB(state: PinState) {
    const pinAddress = this.innerPin.valueOf() - GPIO_B_OFFSET;
    if (state === PinState.HIGH) {
      this.currentStatesB |= pinAddress;
    } else {
      this.currentStatesB &= ~pinAddress;
    }

    return this.privWrite(REGISTER_GPIO_B, this.currentStatesB);
  }

  private async setState(state: PinState) {
    this.oldState = this.pinState;
    await super.write(state);

    if (this.innerPin.valueOf() < GPIO_B_OFFSET) {
      return this.setStateA(state);
    }

    return this.setStateB(state);
  }

  private evaluatePinForChangeA(state: PinState) {
    const pinAddress = this.innerPin.valueOf() - GPIO_A_OFFSET;
    if ((state & pinAddress) !== (this.currentStatesA & pinAddress)) {
      const newState = (state & pinAddress) === pinAddress ? PinState.HIGH : PinState.LOW;
      if (newState === PinState.HIGH) {
        this.currentStatesA |= pinAddress;
      } else {
        this.currentStatesA &= ~pinAddress;
      }

      const evt = new PinStateChangeEvent(this.oldState, newState, pinAddress);
      this.onPinStateChange(evt);
    }
  }

  private evaluatePinForChangeB(state: PinState) {
    const pinAddress = this.innerPin.valueOf() - GPIO_B_OFFSET;
    if ((state & pinAddress) !== (this.currentStatesB & pinAddress)) {
      const newState = (state & pinAddress) === pinAddress ? PinState.HIGH : PinState.LOW;
      if (newState === PinState.HIGH) {
        this.currentStatesB |= pinAddress;
      } else {
        this.currentStatesB &= ~pinAddress;
      }

      const evt = new PinStateChangeEvent(this.oldState, newState, pinAddress);
      this.onPinStateChange(evt);
    }
  }

  private async setModeA(mode: PinMode) {
    const pinAddress = this.innerPin.valueOf() - GPIO_A_OFFSET;
    if (mode === PinMode.IN) {
      this.currentDirectionA |= pinAddress;
    } else if (mode === PinMode.OUT) {
      this.currentDirectionA &= ~pinAddress;
    }

    await this.privWrite(REGISTER_IODIR_A, this.currentDirectionA);
    return this.privWrite(REGISTER_GPINTEN_A, this.currentDirectionA);
  }

  private async setModeB(mode: PinMode) {
    const pinAddress = this.innerPin.valueOf() - GPIO_B_OFFSET;
    if (mode === PinMode.IN) {
      this.currentDirectionB |= pinAddress;
    } else if (mode === PinMode.OUT) {
      this.currentDirectionB &= ~pinAddress;
    }

    await this.privWrite(REGISTER_IODIR_B, this.currentDirectionB);
    return this.privWrite(REGISTER_GPINTEN_B, this.currentDirectionB);
  }

  private async backgroundPoll() {
    if (this.shuttingDown) {
      return;
    }

    // Only process interrupts if a pin on Port A is configured as an
    // input pin.
    let pinInterruptState = -1;
    if (this.currentDirectionA > 0) {
      // Process interrupts for port A.
      const pinInterruptA = await this.privRead(REGISTER_INTF_A);

      // Validate that there is at least one interrupt active on port A.
      if (pinInterruptA > 0) {
        // Read current pin states on port A.
        pinInterruptState = await this.privRead(REGISTER_GPIO_A);

        // Is there an interrupt flag on this pin?
        this.evaluatePinForChangeA(pinInterruptState);
      }
    }

    // Only process interrupts if a pin on Port B is configured as in
    // input pin.
    if (this.currentDirectionB > 0) {
      // Process interrupts for port B.
      const pinInterruptB = await this.privRead(REGISTER_INTF_B);

      // Validate that there is at least one interrupt active on port B.
      if (pinInterruptB > 0) {
        // Read current pin states on port B.
        pinInterruptState = await this.privRead(REGISTER_GPIO_B);

        // Is there an interrupt flag on this pin?
        this.evaluatePinForChangeB(pinInterruptState);
      }
    }
  }

  private async setPullResistanceA(resistance: PinPullResistance) {
    const pinAddress = this.innerPin.valueOf() - GPIO_A_OFFSET;
    if (resistance === PinPullResistance.PULL_UP) {
      this.currentPullupA |= pinAddress;
    } else {
      this.currentPullupA &= ~pinAddress;
    }

    return this.privWrite(REGISTER_GPPU_A, this.currentPullupA);
  }

  private async setPullResistanceB(resistance: PinPullResistance) {
    const pinAddress = this.innerPin.valueOf() - GPIO_B_OFFSET;
    if (resistance === PinPullResistance.PULL_UP) {
      this.currentPullupB |= pinAddress;
    } else {
      this.currentPullupB &= ~pinAddress;
    }

    return this.privWrite(REGISTER_GPPU_B, this.currentPullupB);
  }

  private getStateA() {
    const pinAddress = this.innerPin.valueOf() - GPIO_A_OFFSET;
    const state = (this.currentStatesA & pinAddress) === pinAddress ? PinState.HIGH : PinState.LOW;
    super.write(state);
    return state;
  }

  private getStateB() {
    const pinAddress = this.innerPin.valueOf() - GPIO_B_OFFSET;
    const state = (this.currentStatesB & pinAddress) === pinAddress ? PinState.HIGH : PinState.LOW;
    super.write(state);
    return state;
  }
}
