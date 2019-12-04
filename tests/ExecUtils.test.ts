import ExecUtils from '../src/lib/ExecUtils';
import StringUtils from '../src/lib/StringUtils';
import * as OS from 'os';

test("executeCommand(): ping executes successfully.", async () => {
    let cmd = "ping -c 1 127.0.0.1";
    let text = "bytes from";
    if (OS.platform() === 'win32') {
        cmd = "ping -n 1 127.0.0.1";
        text = "Reply from 127.0.0.1";
    }

    const empty: string[] = [];
    const result = await ExecUtils.executeCommand(cmd);
    expect(StringUtils.contains(result.toString(), text)).toBeTruthy();
    expect(await ExecUtils.executeCommand(null)).toStrictEqual(empty);
});