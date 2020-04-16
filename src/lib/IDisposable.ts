/**
 * Interface which defines a type which provides a mechanism for releasing
 * unmanaged resources.
 */
export default interface IDisposable {
  /**
   * In subclasses, determines whether or not the current instance has been
   * disposed.
   * @return true if disposed; Otherwise, false.
   * @property
   * @readonly
   */
  isDisposed: boolean;

  /**
   * In subclasses, performs application-defined tasks associated with freeing,
   * releasing, or resetting resources.
   */
  dispose(): void;
}
