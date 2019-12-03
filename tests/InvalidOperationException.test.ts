import InvalidOperationException from '../src/lib/InvalidOperationException';

test("Throws exception", () => {
    const result = new InvalidOperationException("foo");
    expect(() => { throw result }).toThrow(result);
    expect(result.message).toBe("foo");
});