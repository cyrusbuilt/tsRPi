import IllegalArgumentException from '../IllegalArgumentException';
import { GpioPins } from '../IO/GpioPins';
import GpioStandard from '../IO/GpioStandard';
import { PinMode } from '../IO/PinMode';
import { PinState } from '../IO/PinState';
import ObjectDisposedException from '../ObjectDisposedException';
import ILcdTransferProvider from './ILcdTransferProvider';

/**
 * @classdesc Raspberry Pi GPIO (via filesystem) provider for the Micro Liquid
 * Crystal library.
 * @implements [[ILcdTransferProvider]]
 */
export default class GpioTransferProviderStandard implements ILcdTransferProvider {
  /**
   * Gets a value indicating whether this instance
   * is in four-bit mode.
   * @readonly
   * @override
   */
  public readonly isFourBitMode: boolean;

  private objDisposed: boolean;
  private registerSelectPort: GpioStandard;
  private readWritePort?: GpioStandard;
  private enablePort: GpioStandard;
  private dataPorts: GpioStandard[];

  /**
   * Initializes a new instance of the GpioLcdTransferProviderStandard
   * class with all the necessary pins and whether or not to use 4bit mode.
   * @param d0 Data line 0.
   * @param d1 Data line 1.
   * @param d2 Data line 2.
   * @param d3 Data line 3.
   * @param d4 Data line 4.
   * @param d5 Data line 5.
   * @param d6 Data line 6.
   * @param d7 Data line 7.
   * @param fourBitMode If set true, then use 4-bit mode instead of 8.
   * @param rs The RS pin (Register Select).
   * @param enable The enable pin.
   * @param rw The RW pin (Read/Write).
   * @constructor
   * @throws [[IllegalArgumentException]] if 'rs' or 'enable' is
   * GpioPins.GPIO_NONE.
   */
  constructor(
    d0: GpioPins,
    d1: GpioPins,
    d2: GpioPins,
    d3: GpioPins,
    d4: GpioPins,
    d5: GpioPins,
    d6: GpioPins,
    d7: GpioPins,
    fourBitMode: boolean,
    rs: GpioPins,
    enable: GpioPins,
    rw?: GpioPins,
  ) {
    if (rs === GpioPins.GPIO_NONE) {
      throw new IllegalArgumentException("'rs' param must be a GpioPins member " + 'other than GpioPins.GPIO_NONE.');
    }

    this.registerSelectPort = new GpioStandard(rs, PinMode.OUT);
    if (rw !== undefined) {
      this.readWritePort = new GpioStandard(rw, PinMode.OUT);
    }

    if (enable === GpioPins.GPIO_NONE) {
      throw new IllegalArgumentException(
        "'enable' param must be a GpioPins member " + 'other than GpioPins.GPIO_NONE.',
      );
    }

    this.enablePort = new GpioStandard(enable, PinMode.OUT);

    const dataPins = [d0, d1, d2, d3, d4, d5, d6, d7];
    this.dataPorts = new Array<GpioStandard>(dataPins.length);
    for (let i = 0; i < dataPins.length; i++) {
      this.dataPorts[i] = new GpioStandard(dataPins[i], PinMode.OUT);
    }

    this.isFourBitMode = fourBitMode;
    this.objDisposed = false;
  }

  /**
   * Returns true if this instance has been disposed.
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.objDisposed;
  }

  /**
   * Initializes the transfer provider.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async begin() {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioTransferProviderStandard');
    }

    await this.registerSelectPort.provision();
    if (!!this.readWritePort) {
      await this.readWritePort.provision();
    }

    await this.enablePort.provision();
    for (const port of this.dataPorts) {
      await port.provision();
    }
  }

  /**
   * Send the specified data, mode and backlight.
   * @param value The data to send.
   * @param mode Mode for register-select pin (PinState.High =
   * on, PinState.Low = off).
   * @param backlight Turns on the backlight.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async send(value: number, mode: PinState, backlight: boolean) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('GpioTransferProviderStandard');
    }

    // TODO set backlight

    await this.registerSelectPort.write(mode);

    // If there is a RW pin indicated, set it low to write.
    if (this.readWritePort !== undefined) {
      await this.readWritePort.write(PinState.LOW);
    }

    if (this.isFourBitMode) {
      await this.write4Bits(value >> 4);
      await this.write4Bits(value);
    } else {
      await this.write8Bits(value);
    }
  }

  /**
   * Releases all managed resources used by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.registerSelectPort.dispose();
    await this.enablePort.dispose();
    if (this.readWritePort !== undefined) {
      await this.readWritePort.dispose();
    }

    for (const port of this.dataPorts) {
      await port.dispose();
    }

    this.objDisposed = true;
  }

  private async pulseEnable() {
    await this.enablePort.write(PinState.LOW);
    await this.enablePort.write(PinState.HIGH); // Enable pulse must be > 450ns
    await this.enablePort.write(PinState.LOW); // Command needs 37us to settle
  }

  private async write4Bits(value: number) {
    for (let i = 0; i < 4; i++) {
      await this.dataPorts[i + 4].write(((value >> i) & 0x01) === 0x01 ? PinState.HIGH : PinState.LOW);
    }

    await this.pulseEnable();
  }

  private async write8Bits(value: number) {
    for (let i = 0; i < 8; i++) {
      await this.dataPorts[i].write(((value >> i) & 0x01) === 0x01 ? PinState.HIGH : PinState.LOW);
    }

    await this.pulseEnable();
  }
}
