import IComponent from '../IComponent';
import ButtonEvent from './ButtonEvent';
import { ButtonState } from './ButtonState';

/**
 * Possible button event names.
 */
export const ButtonEventTypes = Object.freeze({
  /**
   * The name of the button pressed event.
   */
  STATE_CHANGED: 'stateChanged',

  /**
   * The name of the button pressed event.
   */
  STATE_PRESSED: 'buttonPressed',

  /**
   * The name of the button released event.
   */
  STATE_RELEASED: 'buttonReleased',

  /**
   * The name of the button hold event.
   */
  STATE_HOLD: 'buttonHold',
});

/**
 * A button device abstraction component interface.
 * @extends [[IComponent]]
 */
export default interface IButton extends IComponent {
  /**
   * Gets a value indicating whether this instance is pressed.
   * @readonly
   */
  isPressed: boolean;

  /**
   * Gets a value indicating whether the button is released.
   * @readonly
   */
  isReleased: boolean;

  /**
   * Gets the button state.
   * @readonly
   */
  state: ButtonState;

  /**
   * Checks to see if the button is in a state matching the specified state.
   * @param state The state to check.
   * @returns true if the button is in the specified state; Otherwise, false.
   */
  isState(state: ButtonState): boolean;

  /**
   * Fires the button state changed event.
   * @param btnEvent The event info.
   */
  onStateChanged(btnEvent: ButtonEvent): void;

  /**
   * Fires the button pressend event.
   * @param btnEvent The event info.
   */
  onButtonPressed(btnEvent: ButtonEvent): void;

  /**
   * Fires the button released event.
   * @param btnEvent The event info.
   */
  onButtonReleased(btnEvent: ButtonEvent): void;

  /**
   * Fires the button hold event.
   * @param btnEvent The event info.
   */
  onButtonHold(btnEvent: ButtonEvent): void;
}
