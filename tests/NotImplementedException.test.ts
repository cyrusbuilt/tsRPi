import NotImplementedException from '../src/lib/NotImplementedException';

test("Throws exception", () => {
    const result = new NotImplementedException("foo");
    expect(() => { throw result }).toThrow(result);
    expect(result.message).toBe("foo");
});