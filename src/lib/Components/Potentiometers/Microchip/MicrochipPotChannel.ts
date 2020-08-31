/**
 * A channel and instance of MCP45XX or MCP46XX-series potentiometers
 * can be configured for.
 */
export enum MicrochipPotChannel {
  /**
   * Channel A. Pins P0A, P0W, and P0B.
   */
  A = 1,

  /**
   * Channel B. Pins P1A, P1W, and P1B.
   */
  B = 2,

  /**
   * Channel C. Pins P2A, P2W, and P2B.
   */
  C = 3,

  /**
   * Channel D. Pins P3A, P3W, and P3B.
   */
  D = 4,

  /**
   * No channel assignment.
   */
  NONE = 0,
}
