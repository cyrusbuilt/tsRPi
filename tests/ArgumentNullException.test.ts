import ArgumentNullException from '../src/lib/ArgumentNullException';

test("Throws exception", () => {
    const result = new ArgumentNullException("Foo");

    expect(() => { throw result }).toThrow(result);
    expect(result.message).toBe("Foo");
});