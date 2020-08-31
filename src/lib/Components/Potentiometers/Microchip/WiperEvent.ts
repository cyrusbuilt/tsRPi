import DeviceControlChannel from './DeviceControlChannel';
import MicrochipPotDeviceController from './MicrochipPotDeviceController';

/**
 * @classdesc Wiper event info class.
 */
export default class WiperEvent {
  private mChannel: DeviceControlChannel;
  private mController: MicrochipPotDeviceController;
  private mValue: number;

  /**
   * Initializes a new instance of the WiperEvent class with the channel, controller, and value.
   * @param channel The control channel for the wiper.
   * @param controller The device controller.
   * @param value The device reading value.
   * @constructor
   */
  constructor(channel: DeviceControlChannel, controller: MicrochipPotDeviceController, value: number = 0) {
    this.mChannel = channel;
    this.mController = controller;
    this.mValue = value;
  }

  /**
   * Sets the channel value.
   * @param nonVol Set true if setting the channel value of a
   * non-volatile wiper, or false for a volatile wiper.
   */
  public async setChannelValue(nonVol: boolean) {
    await this.mController.setValue(this.mChannel, this.mValue, nonVol);
  }
}

/**
 * Wiper event subscription object.
 */
export interface IWiperEventSubscription {
  /**
   * Removes the event subscription.
   */
  remove: () => void;
}

/**
 * Wiper event callback method.
 */
export type WiperEventCallback = (evt: WiperEvent) => void;
