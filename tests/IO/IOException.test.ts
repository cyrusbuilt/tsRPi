import IOException from '../../src/lib/IO/IOException';

test("Throws exception", () => {
    const result = new IOException("foo");
    expect(() => { throw result }).toThrow(result);
    expect(result.message).toBe("foo");
});