import { MicrochipPotChannel } from './MicrochipPotChannel';

/**
 * @classdesc Terminal configuration settings for the channel a given
 * potentiometer instance is configured for.
 */
export default class MCPTerminalConfiguration {
  private mChannel: MicrochipPotChannel;
  private mChannelEnabled: boolean;
  private mPinAenabled: boolean;
  private mPinWenabled: boolean;
  private mPinBenabled: boolean;

  /**
   * Initializes a new instance of the [[MCPTerminalConfiguration]]
   * class with the channel and flags to indicate whether or not the channel
   * is enabled or disabled as well as flags to indicate whether or not each
   * pin is enabled or disabled.
   * @param channel The channel this terminal configuration represents.
   * See MicrochipPotChannel. Default is [[MicrochipPotChannel.NONE]].
   * @param channelEnabled Set true to enable the channel. Default is false.
   * @param pinAenabled Set true to enable pin A. Default is false.
   * @param pinWenabled Set true to enable pin W. Default is false.
   * @param pinBenabled Set true to enable pin B. Default is false.
   * @constructor
   */
  constructor(
    channel: MicrochipPotChannel = MicrochipPotChannel.NONE,
    channelEnabled: boolean = false,
    pinAenabled: boolean = false,
    pinWenabled: boolean = false,
    pinBenabled: boolean = false,
  ) {
    this.mChannel = channel;
    this.mChannelEnabled = channelEnabled;
    this.mPinAenabled = pinAenabled;
    this.mPinWenabled = pinWenabled;
    this.mPinBenabled = pinBenabled;
  }

  /**
   * Gets the channel.
   * @readonly
   */
  public get channel() {
    return this.mChannel;
  }

  /**
   * Gets a value indicating whether the entire channel is enabled or disabled.
   * @readonly
   */
  public get isChannelEnabled() {
    return this.mChannelEnabled;
  }

  /**
   * Gets whether or not pin A of this channel is enabled.
   * @readonly
   */
  public get isPinAenabled() {
    return this.mPinAenabled;
  }

  /**
   * Gets a value indicating whether or not pin W of this channel is enabled.
   * @readonly
   */
  public get isPinWenabled() {
    return this.mPinWenabled;
  }

  /**
   * Gets a value indicating whether or not pin B of this channel is enabled.
   * @readonly
   */
  public get isPinBenabled() {
    return this.mPinBenabled;
  }
}
