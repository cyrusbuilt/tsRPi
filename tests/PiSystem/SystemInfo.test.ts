import SystemInfo from '../../src/lib/PiSystem/SystemInfo';
import { BoardType } from '../../src/lib/PiSystem/BoardType';
import ExecUtils from '../../src/lib/ExecUtils';
import InvalidOperationException from '../../src/lib/InvalidOperationException';
import { mocked } from 'ts-jest/utils';
import { ClockType } from '../../src/lib/PiSystem/ClockType';

jest.mock('../../src/lib/ExecUtils');

const mockedExecUtils = mocked(ExecUtils, true);
const mockProcInfo: string[] = [
    "Processor:Cortex A9",
    "BogoMIPS:123456",
    "Features:feature1 feature2 feature3",
    "CPU implementer:foo",
    "CPU architecture:ARM",
    "CPU variant:bar",
    "CPU part:foobar",
    "CPU revision:A123",
    "Hardware:foo",
    "Revision:0032",
    "Serial:123456"
];

const mockMemInfo: string[] = [
    "           total       used       free     shared    buffers     cached",
    "Mem:     459771904  144654336  315117568          0   21319680   63713280",
    "-/+ buffers/cache:   59621376  400150528",
	"Swap:    104853504          0  104853504"
];

test("Get CPU info rejects when bogos tag provided.", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const iopErr = new InvalidOperationException('Invalid target: foo');
    await expect(SystemInfo.getCpuInfo('foo')).rejects.toThrow(iopErr);
});

test("Can get processor", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getProcessor();
    expect(val).toBe("Cortex A9");
});

test("Can get Bogo MIPS", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getBogoMips();
    expect(val).toBe("123456");
});

test("Can get CPU features", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuFeatures();
    expect(val.length).toBe(3);
});

test("Can get CPU implementor", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuImplementer();
    expect(val).toBe("foo");
});

test("Can get CPU architecture", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuArchitecture();
    expect(val).toBe("ARM");
});

test("Can get CPU variant", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuVariant();
    expect(val).toBe("bar");
});

test("Can get CPU part", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuPart();
    expect(val).toBe("foobar");
});

test("Can get CPU revision", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getCpuRevision();
    expect(val).toBe("A123");
});

test("Can get hardware", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getHardware();
    expect(val).toBe("foo");
});

test("Can get system revision", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getSystemRevision();
    expect(val).toBe("0032");
});

test("Can get serial #", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getSerial();
    expect(val).toBe("123456");
});

test("Can get OS name", () => {
    const val = SystemInfo.getOsName();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get OS version", () => {
    const val = SystemInfo.getOsVersion();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get OS arch", () => {
    const val = SystemInfo.getOsArch();
    expect(val.length).toBeGreaterThan(0);
});

test("Can get firmware build", async () => {
    const result = ["version 1234"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getOsFirmwareBuild();
    expect(val).toBe("1234");

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    const iopErr = new InvalidOperationException("Invalid command or response.");
    await expect(SystemInfo.getOsFirmwareBuild()).rejects.toThrow(iopErr);
});

test("Can get firmware date", async () => {
    const result = ["12/30/2019"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getOsFirmwareDate();
    expect(val).toBe("12/30/2019");

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    const iopErr = new InvalidOperationException("Invalid command or response.");
    await expect(SystemInfo.getOsFirmwareDate()).rejects.toThrow(iopErr);    
});

test("Can get total memory", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryTotal();
    expect(val).toBe(459771904);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryTotal();
    expect(val).toBe(-1);
});

test("Can get memory used", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryUsed();
    expect(val).toBe(144654336);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryUsed();
    expect(val).toBe(-1);
});

test("Can get memory free", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryFree();
    expect(val).toBe(315117568);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryFree();
    expect(val).toBe(-1);
});

test("Can get memory shared", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryShared();
    expect(val).toBe(0);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryShared();
    expect(val).toBe(-1);
});

test("Can get mem buffers", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryBuffers();
    expect(val).toBe(21319680);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryBuffers();
    expect(val).toBe(-1);
});

test("Can get mem cached", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockMemInfo));
    let val = await SystemInfo.getMemoryCached();
    expect(val).toBe(63713280);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getMemoryCached();
    expect(val).toBe(-1);
});

test("Can get board type", async () => {
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(mockProcInfo));
    const val = await SystemInfo.getBoardType();
    expect(val).toBe(BoardType.MODEL1B_REV1);

    // TODO need to test different board types.
});

test("Can get CPU temp", async () => {
    const result = ["temp=42.3'C"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getCpuTemperature();
    expect(val).toBe(42.3);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    const iopErr = new InvalidOperationException("Invalid command or response.");
    await expect(SystemInfo.getCpuTemperature()).rejects.toThrow(iopErr);
});

test("Can get CPU voltage", async () => {
    const result = ["core=3.3"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getCpuVoltage();
    expect(val).toBe(3.3);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    const iopErr = new InvalidOperationException("Invalid command or response.");
    await expect(SystemInfo.getCpuVoltage()).rejects.toThrow(iopErr);
});

test("Can get get mem voltage SDRAM C", async () => {
    const result = ["sdram_c=1.5"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getMemoryVoltageSdramC();
    expect(val).toBe(1.5);
});

test("Can get mem voltage SDRAM I", async () => {
    const result = ["sdram_i=1.5"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getMemoryVoltageSdramI();
    expect(val).toBe(1.5);
});

test("Can get mem voltage SDRAM P", async () => {
    const result = ["sdram_p=1.5"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.getMemoryVoltageSdramP();
    expect(val).toBe(1.5);
});

test("Can check H264 enabled", async () => {
    let result = ["H264=Enabled"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    let val = await SystemInfo.isCodecH264Enabled();
    expect(val).toBeTruthy();

    result = ["foo=bar"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    val = await SystemInfo.isCodecH264Enabled();
    expect(val).toBeFalsy();
});

test("Can check MPG2 enabled", async () => {
    const result = ["MPG2=Enabled"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.isCodecMPG2Enabled();
    expect(val).toBeTruthy();
});

test("Can check WVC1 enabled", async () => {
    const result = ["WVC1=Enabled"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.isCodecWVC1Enabled();
    expect(val).toBeTruthy();
});

test("Can get clock frequency", async () => {
    const result = ["Core=72000"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    let val = await SystemInfo.getClockFrequency(ClockType.CORE);
    expect(val).toBe(72000);

    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve([]));
    val = await SystemInfo.getClockFrequency(ClockType.CORE);
    expect(val).toBe(-1);
});

test("Can check hard float ABI", async () => {
    const result = ["gnueabihf", "Tag_ABI_HardFP_use:foo"];
    mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));
    const val = await SystemInfo.isHardFloatABI();
    expect(val).toBeTruthy();
});

test("Can get current time", () => {
    expect(SystemInfo.getCurrentTimeMillis()).toBeGreaterThan(0);
});