import { PinState } from './PinState';

/**
 * @classdesc Pin state change event.
 */
export default class PinStateChangeEvent {
  /**
   * Gets the previous state of the pin.
   * @property
   * @readonly
   */
  public readonly oldState: PinState;

  /**
   * Gets the new (current) state of the pin.
   * @property
   * @readonly
   */
  public readonly newState: PinState;

  /**
   * Gets the pin address.
   * @property
   * @readonly
   */
  public readonly pinAddress: number;

  /**
   * Initializes a new instance of the jsrpi.IO.PinStateChangeEvent class.
   * @param oldState The previous pin state.
   * @param newState The new pin state.
   * @param address The pin address.
   * @constructor
   */
  constructor(oldState: PinState, newState: PinState, address: number) {
    this.oldState = oldState;
    this.newState = newState;
    this.pinAddress = address;
  }
}

/**
 * A subscription to the pin state change event.
 */
export interface IPinStateChangeEventSubscription {
  /**
   * Removes the subscription.
   */
  remove: () => void;
}

/**
 * Callback method for pin state change events.
 * @param event The event info object.
 */
export type PinStateChangeEventCallback = (event: PinStateChangeEvent) => void;
