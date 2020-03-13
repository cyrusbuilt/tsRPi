import IDisposable from '../IDisposable';

/**
 * A hardware abstraction component interface.
 * @extends [[IDisposable]]
 */
export default interface IComponent extends IDisposable {
  /**
   * Gets or sets the name of this component.
   */
  componentName?: string;

  /**
   * Gets or sets the object this component is tagged with (if set).
   */
  tag?: any;

  /**
   * In an implementing class, gets the property collection.
   * @readonly
   */
  propertyCollection?: Map<string, any>;

  /**
   * In an implementing class, checks to see if the property collection contains
   * the specified key.
   * @param key The key name of the property to check for.
   * @returns true if the property collection contains the key;
   * Otherwise, false.
   */
  hasProperty(key: string): boolean;
}
