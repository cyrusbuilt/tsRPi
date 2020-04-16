import StringUtils from '../src/lib/StringUtils';

const testString = "Hello World!";

test("create(): created string equals test string.", () => {
    const test = StringUtils.create('c', 3);
    expect(test).toBe('ccc');
    expect(StringUtils.create(null, 3)).toBe('   ');
    expect(StringUtils.create(StringUtils.EMPTY, 3)).toBe('   ');
});

test("padLeft(): String left-padded with 3 'a' characters.", () => {
    const test = StringUtils.padLeft(testString, 'a', 3);
    expect(test).toBe("aaaHello World!");
    expect(StringUtils.padLeft(testString, null, 3)).toBe("   Hello World!");
    expect(StringUtils.padLeft(testString, StringUtils.EMPTY, 3)).toBe("   Hello World!");
});

test("padRight(): String right-padded with 3 'a' characters.", () => {
    expect(StringUtils.padRight(testString, 'a', 3)).toBe("Hello World!aaa");
    expect(StringUtils.padRight(testString, null, 3)).toBe("Hello World!   ");
    expect(StringUtils.padRight(testString, StringUtils.EMPTY, 3)).toBe("Hello World!   ");
});

test("pad(): Pads both sides of the string with 3 'a' characters.", () => {
    expect(StringUtils.pad(testString, 'a', 3)).toBe("aaaHello World!aaa");
    expect(StringUtils.pad(testString, null, 3)).toBe("   Hello World!   ");
    expect(StringUtils.pad(testString, StringUtils.EMPTY, 3)).toBe("   Hello World!   ");
});

test("padCenter(): Pads the middle of the string with 3 'a' characters.", () => {
    expect(StringUtils.padCenter(testString, 'a', 3)).toBe("Hello aaaWorld!");
    expect(StringUtils.padCenter(testString, null, 3)).toBe("Hello    World!");
    expect(StringUtils.padCenter(testString, StringUtils.EMPTY, 3)).toBe("Hello    World!");
    expect(StringUtils.padCenter(testString, null, 0)).toBe(testString);
});

test("endsWith(): testString is ends with '!' is true.", () => {
    expect(StringUtils.endsWith(testString, "!")).toBeTruthy();
});

test("startsWith(): testString starts with 'H' is true.", () => {
    expect(StringUtils.startsWith(testString, "H")).toBeTruthy();
});

test("isNullOrEmpty(): testString will return false, null, and empty values return true.", () => {
    expect(StringUtils.isNullOrEmpty(testString)).toBeFalsy();
    expect(StringUtils.isNullOrEmpty(null)).toBeTruthy();
    expect(StringUtils.isNullOrEmpty(StringUtils.EMPTY)).toBeTruthy();
});

test("trim(): Returns trimmed string or empty string.", () => {
    expect(StringUtils.trim(` ${testString} `)).toBe(testString);
    expect(StringUtils.trim(null)).toBe(StringUtils.EMPTY);
    expect(StringUtils.trim(StringUtils.EMPTY)).toBe(StringUtils.EMPTY);
});

test("contains(): testString contains 'World!' is true.", () => {
    expect(StringUtils.contains(testString, "World!")).toBeTruthy();
});

test("convertStringToByte(): Byte arrays are equal.", () => {
    function arraysEqual(a: number[] | null, b: number[] | null) {
        if (a === b) {
            return true;
        }

        if (a === null || b === null) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        let result = true;
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                result = false;
                break;
            }
        }

        return result;
    }

    const byte = StringUtils.convertStringToByte("1");
    expect(arraysEqual(byte, [49])).toBeTruthy();
});