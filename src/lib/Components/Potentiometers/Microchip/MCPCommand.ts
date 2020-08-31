/**
 * MCP45XX and MCP46XX commands.
 */
export enum MCPCommand {
  /**
   * Writes to the device.
   */
  WRITE = 0x00 << 2,

  /**
   * Increase the resistance.
   */
  INCREASE = 0x01 << 2,

  /**
   * Decrease the resistance.
   */
  DECREASE = 0x02 << 2,

  /**
   * Reads the current value.
   */
  READ = 0x03 << 2,
}
