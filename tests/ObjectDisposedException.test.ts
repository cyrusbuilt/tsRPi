import ObjectDisposedException from '../src/lib/ObjectDisposedException';
import StringUtils from '../src/lib/StringUtils';

test("Throws exception", () => {
    const result = new ObjectDisposedException("foo");
    expect(() => { throw result }).toThrow(result);
    expect(StringUtils.contains(result.message, "foo")).toBeTruthy();
});