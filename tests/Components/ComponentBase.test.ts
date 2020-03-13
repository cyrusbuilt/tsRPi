import ComponentBase from '../../src/lib/Components/ComponentBase';

test("Can construct/destruct", () => {
    const props = new Map<string, any>();
    props.set('foo', 'bar');
    
    let component = new ComponentBase(props);
    expect(component.isDisposed).toBeFalsy();
    expect(component.hasProperty('foo')).toBeTruthy();
    expect(component.componentName).toBeUndefined();
    expect(component.toString()).toBe('ComponentBase');
    expect(component.tag).toBeUndefined();
    expect(component.propertyCollection?.size === props.size);

    component.componentName = 'NewComponent'
    expect(component.componentName).toBe('NewComponent');
    expect(component.toString()).toBe('NewComponent');

    component.tag = [1, 2];
    expect(Array.isArray(component.tag)).toBeTruthy();

    component.setProperty('foo', 'fighters');
    expect(component.propertyCollection?.get('foo')).toBe('fighters');

    component = new ComponentBase();      // Construct without props so propertyCollection is undefined.
    expect(component.hasProperty('foo')).toBeFalsy();
    component.setProperty('foo', 'bar');  // Creates new prop collection and adds prop.
    expect(component.hasProperty('foo')).toBeTruthy();
    expect(component.propertyCollection?.get('foo')).toBe('bar');

    component.dispose();
    expect(component.isDisposed).toBeTruthy();
    component.dispose();   // again for coverage;
});