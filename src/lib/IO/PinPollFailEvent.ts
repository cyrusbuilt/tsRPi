/**
 * @classdesc Pin poll failure event.
 */
export default class PinPollFailEvent {
  /**
   * Gets the Error (exception) that is the cause of the failure event.
   * @property
   */
  public readonly failCause: Error;

  /**
   * Initializes a new instance of the [[PinPollFailEvent]] class with the
   * exception that is the cause of the event.
   * @param failureCause The error (exception) that is the cause of the
   * event.
   * @constructor
   */
  constructor(failureCause: Error) {
    this.failCause = failureCause;
  }
}

/**
 * A Pin poll fail event subscription.
 */
export interface IPinPollFailEventSubscription {
  /**
   * Removes the event subscription.
   */
  remove: () => void;
}

/**
 * The callback method for a PinPollFailEvent. Event listeners should
 * be of this type.
 * @param ppfe The event info object.
 */
export type PinPollFailEventCallback = (ppfe: PinPollFailEvent) => void;
