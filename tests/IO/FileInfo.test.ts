import * as FS from 'fs';
import * as OS from 'os';
import * as Path from 'path';
import FileInfo from '../../src/lib/IO/FileInfo';
import StringUtils from '../../src/lib/StringUtils';

let filePath = `${OS.homedir}/temp.txt`;
if (OS.platform() === 'win32') {
    filePath = `${OS.homedir}\\temp.txt`;
}

beforeEach(() => {
    let fd = -1;
    try {
        fd = FS.openSync(filePath, 'r');
    }
    catch(e) {}

    if (fd === -1) {
        try {
            fd = FS.openSync(filePath, 'w');
        }
        catch(e) {}
    }

    if (fd !== -1) {
        FS.closeSync(fd);
    }
});

afterEach(() => {
    if (FS.existsSync(filePath)) {
        FS.unlinkSync(filePath);
    }
});

test("Test constructor", () => {
    let f = new FileInfo(filePath);
    expect(f).toBeDefined();
    expect(() => { f = new FileInfo(StringUtils.EMPTY) }).toThrow();
});

test("Test toString()", () => {
    const f = new FileInfo(filePath);
    expect(f.toString()).toBe(filePath);
});

test("Test file exists", async () => {
    const f = new FileInfo(filePath);
    const doesExist = await f.exists();
    expect(doesExist).toBeTruthy();
});

test("Test gets file's directory name", () => {
    const f = new FileInfo(filePath);
    const expectedDirname = Path.dirname(Path.normalize(filePath));
    expect(f.getDirectoryName()).toBe(expectedDirname);
});

test("Test gets file's name", () => {
    const f = new FileInfo(filePath);
    expect(f.getFileName()).toBe("temp.txt")
});

test("Test gets the file extension", () => {
    const f = new FileInfo(filePath);
    expect(f.getFileExtension()).toBe("txt");
});

test("Test deletes test file", async () => {
    const f = new FileInfo(filePath);
    await f.delete();
    const doesExist = await f.exists();
    expect(doesExist).toBeFalsy();
});

test("Test get the file length (zero bytes)", async () => {
    let f = new FileInfo(filePath);
    let size = await f.getLength();
    expect(size).toBe(0);

    f = new FileInfo("foo");
    size = await f.getLength();
    expect(size).toBe(0);
});

test("Get the filename without extension", () => {
    const f = new FileInfo(filePath);
    expect(f.getFileNameWithoutExtension()).toBe("temp");
});

test("Get the full file name", () => {
    const f = new FileInfo(filePath);
    let expected = `${OS.homedir()}/temp.txt`;
    if (OS.platform() === 'win32') {
        expected = `${OS.homedir()}\\temp.txt`;
    }

    expect(f.getFullName()).toBe(expected);
});