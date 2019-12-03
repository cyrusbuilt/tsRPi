import IllegalArgumentException from '../src/lib/IllegalArgumentException';

test("Throws exception", () => {
    const result = new IllegalArgumentException("foo");
    expect(() => { throw result }).toThrow(result);
    expect(result.message).toBe("foo");
});