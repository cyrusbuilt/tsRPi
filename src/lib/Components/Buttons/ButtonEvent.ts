import { ButtonState } from './ButtonState';
import IButton from './IButton';

/**
 * @classdesc Button even arguments class.
 */
export default class ButtonEvent {
  private buttonObj: IButton;

  /**
   * Initializes a new instance of the jsrpi.Components.Button.ButtonEvent class
   * with the button that triggered the event.
   * @param button The button associated with this event.
   */
  constructor(button: IButton) {
    this.buttonObj = button;
  }

  /**
   * Gets the button associated with this event.
   * @readonly
   */
  public get button() {
    return this.buttonObj;
  }

  /**
   * Gets a flag indicating whether or not the button is pressed.
   * @readonly
   */
  public get isPressed() {
    return this.buttonObj.isPressed;
  }

  /**
   * Gets a value indicating whether the button is released.
   * @readonly
   */
  public get isReleased() {
    return this.buttonObj.isReleased;
  }

  /**
   * Gets a flag indicating whether or not the button is in the specified state.
   * @param state The state to check.
   * @returns true if the button is in the specified state;
   * Otherwise, false.
   */
  public isState(state: ButtonState) {
    return this.buttonObj.isState(state);
  }
}

/**
 * 
 */
export interface IButtonStateEventSubscription {
  /**
   * 
   */
  remove: () => void;
}

/**
 * 
 */
export type ButtonStateChangeEventCallback = (buttonEvent: ButtonEvent) => void;