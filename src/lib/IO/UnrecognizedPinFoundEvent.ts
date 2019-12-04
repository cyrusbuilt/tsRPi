/**
 * @classdesc Unrecognized pin found event info.
 */
export default class UnrecognizedPinFoundEvent {
  /**
   * Gets the message describing event.
   */
  public readonly eventMessage: string;

  /**
   * Initializes a new instance of the [[UnrecognizedPinFoundEvent]]
   * class with a message describing the event.
   * @param message A message describing the event.
   * @constructor
   */
  constructor(message: string) {
    this.eventMessage = message;
  }
}

/**
 * An unrecognized pin found event subscription.
 * @interface
 */
export interface IUnrecognizedPinFoundEventSubscription {
  /**
   * Removes the event subscription.
   */
  remove: () => void;
}

/**
 * Callback method type for unrecognized pin found event listeners.
 * @param upfe The unrecognized pin found event info object.
 */
export type UnrecognizedPinFoundEventCallback = (upfe: UnrecognizedPinFoundEvent) => void;
