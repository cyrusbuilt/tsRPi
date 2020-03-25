import IGpio from '../../IO/IGpio';
import ObjectDisposedException from '../../ObjectDisposedException';
import Coreutils from '../../PiSystem/CoreUtils';
import ComponentBase from '../ComponentBase';
import IBuzzer from './IBuzzer';

/**
 * A buzzer device abstraction component.
 * @extends [[ComponentBase]]
 * @implements [[IBuzzer]]
 */
export default class BuzzerComponent extends ComponentBase implements IBuzzer {
  /**
   * The minimum PWM frequency value used to stop the pulse (0).
   */
  public static readonly STOP_FREQUENCY: number = 0;

  private pwmPinObj: IGpio;
  private buzzing: boolean;

  /**
   * Initializes a new instance of the [[BuzzerComponent]]
   * class with the PWM pin the buzzer is attached to.
   * @param pwmPin The pin the buzzer is attached to.
   * @param props Optional component properties.
   */
  constructor(pwmPin: IGpio, props?: Map<string, any>) {
    super(props);
    this.buzzing = false;
    this.pwmPinObj = pwmPin;
    this.componentName = 'BuzzerComponent';
  }

  /**
   * Gets the underlying pin the buzzer is attached to.
   * @readonly
   */
  public get pin() {
    return this.pwmPinObj;
  }

  /**
   * Gets whether or not this buzzer is buzzing.
   * @readonly
   */
  public get isBuzzing() {
    return this.buzzing;
  }

  /**
   * Stops the buzzer.
   * @throws [[InvalidOperationException]] if the pin is not configured for PWM.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async stop() {
    await this.internalBuzz(BuzzerComponent.STOP_FREQUENCY);
  }

  /**
   * Starts the buzzer at the specified frequency and (optionally) for the
   * specified duration.
   * @param freq The frequency to buzz at.
   * @param duration The duration in milliseconds. If not specified,
   * buzzes until stopped.
   * @throws [[InvalidOperationException]] if the pin is not configured for PWM.
   * @throws [[ObjectDisposedException]] if this instance has been disposed.
   * @override
   */
  public async buzz(freq: number, duration: number) {
    if (freq < BuzzerComponent.STOP_FREQUENCY) {
      freq = BuzzerComponent.STOP_FREQUENCY;
    }

    await this.internalBuzz(freq);
    setTimeout(async () => {
      await this.stop();
    }, duration);
  }

  /**
   * Returns the string representation of this object. In this case, it simply
   * returns the component name.
   * @override
   */
  public toString() {
    return this.componentName || '';
  }

  /**
   * Releases all resources managed by this component.
   * @override
   */
  public async dispose() {
    if (this.isDisposed) {
      return;
    }

    await this.pwmPinObj.dispose();
    super.dispose();
  }

  private async internalBuzz(freq: number) {
    if (this.isDisposed) {
      throw new ObjectDisposedException('BuzzerComponent');
    }

    if (freq === BuzzerComponent.STOP_FREQUENCY) {
      await this.pwmPinObj.setPwm(freq);
      this.buzzing = false;
    } else {
      const range = 600000 / freq;
      this.pwmPinObj.pwmRange = range;
      await this.pwmPinObj.setPwm(freq / 2);
      this.buzzing = true;
    }
  }
}
