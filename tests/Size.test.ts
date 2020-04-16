import Size from '../src/lib/Size';

test('Tests size constructor and members', () => {
    const test = new Size(1, 2);
    expect(test).toBeDefined();
    expect(test.width).toBe(1);
    expect(test.height).toBe(2);
});