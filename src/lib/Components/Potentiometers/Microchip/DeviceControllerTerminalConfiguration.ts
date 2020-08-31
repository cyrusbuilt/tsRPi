import DeviceControlChannel from './DeviceControlChannel';

/**
 * @classdesc The device's terminal configuration for a certain channel.
 */
export default class DeviceControllerTerminalConfiguration {
  private mChannel: DeviceControlChannel;
  private mChannelEnabled: boolean;
  private mPinAEnabled: boolean;
  private mPinBEnabled: boolean;
  private mPinWEnabled: boolean;

  /**
   * Initializes a new instance of the [[DeviceControllerTerminalConfiguration]]
   * class with the device control channel, whether or not the
   * channel is enabled, whether or not pin A is enabled,
   * whether or not pin W is enabled, and whether or pin
   * B is enabled.
   * @param channel The device control channel.
   * @param channelEnabled Set true to enable the channel.
   * @param pinAEnabled Set true to enable pin A.
   * @param pinBEnabled Set true to enable pin B.
   * @param pinWEnabled Set true to enable pin W.
   * @constructor
   */
  constructor(
    channel: DeviceControlChannel,
    channelEnabled: boolean = false,
    pinAEnabled: boolean = false,
    pinBEnabled: boolean = false,
    pinWEnabled: boolean = false,
  ) {
    this.mChannel = channel;
    this.mChannelEnabled = channelEnabled;
    this.mPinAEnabled = pinAEnabled;
    this.mPinBEnabled = pinBEnabled;
    this.mPinWEnabled = pinWEnabled;
  }

  /**
   * Gets the channel.
   * @readonly
   */
  public get channel() {
    return this.mChannel;
  }

  /**
   * Gets a value indicating whether or not the channel is enabled.
   * @readonly
   */
  public get channelEnabled() {
    return this.mChannelEnabled;
  }

  /**
   * Gets a value indicating whether or not pin A is enabled.
   * @readonly
   */
  public get pinAEnabled() {
    return this.mPinAEnabled;
  }

  /**
   * Gets a value indicating whether or not pin W is enabled.
   * @readonly
   */
  public get pinWEnabled() {
    return this.mPinWEnabled;
  }

  /**
   * Gets a value indicating whether or not pin B is enabled.
   * @readonly
   */
  public get pinBEnabled() {
    return this.mPinBEnabled;
  }
}
