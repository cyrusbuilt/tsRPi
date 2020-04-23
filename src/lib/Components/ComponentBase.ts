import { EventEmitter } from 'events';
import IComponent from './IComponent';

/**
 * @classdesc Base class for hardware abstraction components.
 * @extends [[EventEmitter.EventEmitter]]
 * @implements [[IComponent]]
 */
export default class ComponentBase extends EventEmitter implements IComponent {
  /**
   * Gets or sets the name of this component.
   * @override
   */
  public componentName?: string;

  /**
   * Gets or sets the object this component is tagged with (if set).
   * @override
   */
  public tag?: any;

  private props?: Map<string, any>;
  private objDisposed: boolean;

  /**
   * Initializes a new instance of the [[ComponentBase]] class with
   * an optional array of properties.
   * @param props A collection of component properties (optional).
   * @constructor
   */
  constructor(props?: Map<string, any>) {
    super();
    this.props = props;
    this.objDisposed = false;
  }

  /**
   * Determines whether or not the current instance has been disposed.
   * @readonly
   * @override
   */
  public get isDisposed() {
    return this.objDisposed;
  }

  /**
   * Gets the custom property collection.
   * @readonly
   * @override
   */
  public get propertyCollection() {
    return this.props;
  }

  /**
   * Checks to see if the property collection contains the specified key.
   * @param key The key name of the property to check for.
   * @returns true if the property collection contains the key;
   * Otherwise, false.
   * @override
   */
  public hasProperty(key: string) {
    return (this.props && this.props.has(key)) || false;
  }

  /**
   * Sets the value of the specified property. If the property does not already exist
   * in the property collection, it will be added. If the property collection
   * is undefined, it will be created.
   * @param key The property name (key).
   * @param value The value to assign to the property.
   */
  public setProperty(key: string, value: any) {
    if (!this.props) {
      this.props = new Map<string, any>();
    }

    this.props.set(key, value);
  }

  /**
   * Returns the string representation of this object. In this case, it simply
   * returns the component name.
   * @returns The name of the component
   */
  public toString(): string {
    return this.componentName || 'ComponentBase';
  }

  /**
   * Releases all managed resources used by this instance.
   * @override
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    if (this.props) {
      this.props.clear();
      this.props = undefined;
    }

    this.tag = undefined;
    this.componentName = undefined;
    this.objDisposed = true;
  }
}
