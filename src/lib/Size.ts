/**
 * A 2-dimensional size structure.
 */
export default class Size {
  /**
   * An empty instance of Size.
   */
  public static readonly EMPTY = new Size(0, 0);

  /**
   * The object width.
   */
  public width: number;

  /**
   * The object height.
   */
  public height: number;

  /**
   * Initializes a new instance of the Size class.
   * @param width The object width.
   * @param height The object height.
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
