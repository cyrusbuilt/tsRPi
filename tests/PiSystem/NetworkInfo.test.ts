import NetworkInfo from '../../src/lib/PiSystem/NetworkInfo';
import ExecUtils from '../../src/lib/ExecUtils';
import { mocked } from 'ts-jest/utils';

jest.mock('../../src/lib/ExecUtils');

test("Can get hostname", () => {
    const val = NetworkInfo.getHostName();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get FQDN", async () => {
    const result: string[] = ['name1', 'name2', 'name3'];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await NetworkInfo.getFQDN();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get IP addresses", () => {
    const val = NetworkInfo.getIPAddresses();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get the primary IP address", async () => {
    const result: string[] = ['192.168.0.5', '127.0.0.1'];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await NetworkInfo.getIPAddress();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get all FQDNs", async () => {
    const result: string[] = ['name1', 'name2'];
    const mockedExecUtils = mocked(ExecUtils, true);
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await NetworkInfo.getAllFQDNs();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get name servers", () => {
    const result = NetworkInfo.getNameServers();
    expect(result.length).toBeGreaterThan(0);
});