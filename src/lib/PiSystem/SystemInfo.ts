import * as OS from 'os';
import ExecUtils from '../ExecUtils';
import InvalidOperationException from '../InvalidOperationException';
import StringUtils from '../StringUtils';
import { BoardType } from './BoardType';
import { ClockType } from './ClockType';

/**
 * @classdesc This module provides methods for getting system-specific info
 * about the host OS and the board it is running on.
 */
export default class SystemInfo {
  /**
   * Gets information about the CPU and returns the value from the specified
   * target field.
   * @param target The target attribute to get the value of.
   * @returns The value of the specified CPU attribute.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuInfo(target: string) {
    if (SystemInfo.cpuInfo === null) {
      SystemInfo.cpuInfo = [];
      const result = await ExecUtils.executeCommand('cat /proc/cpuinfo');
      if (!!result.length) {
        let parts: string[] = [];
        for (const line of result) {
          parts = line.split(':');
          if (
            parts.length >= 2 &&
            !StringUtils.isNullOrEmpty(StringUtils.trim(parts[0])) &&
            !StringUtils.isNullOrEmpty(StringUtils.trim(parts[1]))
          ) {
            SystemInfo.cpuInfo[StringUtils.trim(parts[0])] = StringUtils.trim(parts[1]);
          }
        }
      }
    }

    if (target in SystemInfo.cpuInfo) {
      return SystemInfo.cpuInfo[target];
    }

    throw new InvalidOperationException(`Invalid target: ${target}`);
  }

  /**
   * Gets the processor.
   * @returns The processor.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getProcessor() {
    const val = await SystemInfo.getCpuInfo('Processor');
    return val as string;
  }

  /**
   * Gets the Bogo MIPS.
   * @returns The Bogo MIPS
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getBogoMips() {
    const val = await SystemInfo.getCpuInfo('BogoMIPS');
    return val as string;
  }

  /**
   * Gets the CPU features.
   * @returns The CPU features.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuFeatures() {
    const result = await SystemInfo.getCpuInfo('Features');
    return (result as string).split(StringUtils.DEFAULT_PAD_CHAR);
  }

  /**
   * Gets the CPU implementer.
   * @returns The CPU implementer.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuImplementer() {
    const val = await SystemInfo.getCpuInfo('CPU implementer');
    return val as string;
  }

  /**
   * Gets the CPU architecture.
   * @returns The CPU architecture.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuArchitecture() {
    const val = await SystemInfo.getCpuInfo('CPU architecture');
    return val as string;
  }

  /**
   * Gets the CPU variant.
   * @returns The CPU variant.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuVariant() {
    const val = await SystemInfo.getCpuInfo('CPU variant');
    return val as string;
  }

  /**
   * Gets the CPU part.
   * @returns The CPU part.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuPart() {
    const val = await SystemInfo.getCpuInfo('CPU part');
    return val as string;
  }

  /**
   * Gets the CPU revision.
   * @returns The CPU revision.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getCpuRevision() {
    return SystemInfo.getCpuInfo('CPU revision');
  }

  /**
   * Gets the hardware the system is implemented on.
   * @returns The hardware.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getHardware() {
    return SystemInfo.getCpuInfo('Hardware');
  }

  /**
   * Gets the system revision.
   * @returns The system revision.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getSystemRevision() {
    return SystemInfo.getCpuInfo('Revision');
  }

  /**
   * Gets the serial number.
   * @returns The serial number.
   * @throws [[InvalidOperationException]] if the specified target is invalid (unknown).
   */
  public static async getSerial() {
    return SystemInfo.getCpuInfo('Serial');
  }

  /**
   * Gets the name of the OS.
   * @returns The OS name.
   */
  public static getOsName() {
    return OS.type();
  }

  /**
   * Gets the OS version.
   * @returns The OS version.
   */
  public static getOsVersion() {
    return OS.release();
  }

  /**
   * Gets the OS architecture.
   * @returns The OS architecture.
   */
  public static getOsArch() {
    return OS.arch();
  }

  /**
   * Gets the OS firmware build.
   * @returns The OS firmware build.
   * @throws [[InvalidOperationException]] if invalid command or response.
   */
  public static async getOsFirmwareBuild() {
    let val = StringUtils.EMPTY;
    const results = await ExecUtils.executeCommand('/opt/vc/bin/vcgencmd version');
    if (!!results.length) {
      for (const line of results) {
        if (StringUtils.startsWith(line, 'version ')) {
          val = line;
          break;
        }
      }
    }

    if (!StringUtils.isNullOrEmpty(val)) {
      return val.substring(8);
    }

    throw new InvalidOperationException('Invalid command or response.');
  }

  /**
   * Gets the OS firwmware date.
   * @returns The OS firwmware date.
   * @throws [[InvalidOperationException]] if an unexpected response is received.
   */
  public static async getOsFirmwareDate() {
    let val = StringUtils.EMPTY;
    const results = await ExecUtils.executeCommand('/opt/vc/bin/vcgencmd version');
    if (!!results.length) {
      val = results[0];
    }

    if (!StringUtils.isNullOrEmpty(val)) {
      return val;
    }

    throw new InvalidOperationException('Invalid command or response.');
  }

  /**
   * Gets the total amount of system memory.
   * @returns If successful, the total system memory; Otherwise, -1.
   */
  public static async getMemoryTotal() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[0];
    }

    return -1;
  }

  /**
   * Gets the amount of memory consumed.
   * @returns If successful, the amount of memory that is in use;
   * Otherwise, -1.
   */
  public static async getMemoryUsed() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[1];
    }

    return -1;
  }

  /**
   * Gets the free memory available.
   * @returns If successful, the amount of memory available; Otherwise, -1.
   */
  public static async getMemoryFree() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[2];
    }

    return -1;
  }

  /**
   * Gets the amount of shared memory.
   * @returns If successful, the shared memory; Otherwise, -1.
   */
  public static async getMemoryShared() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[3];
    }

    return -1;
  }

  /**
   * Gets the buffer memory.
   * @returns If successful, the buffer memory; Otherwise, -1.
   */
  public static async getMemoryBuffers() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[4];
    }

    return -1;
  }

  /**
   * Gets the amount of cache memory.
   * @returns If successful, the cache memory; Otherwise, -1.
   */
  public static async getMemoryCached() {
    const values = await SystemInfo.getMemory();
    if (!!values.length) {
      return values[5];
    }

    return -1;
  }

  /**
   * Gets the type of the board the executing script is running on.
   * @returns The board type.
   */
  public static async getBoardType() {
    const revision = await SystemInfo.getSystemRevision();
    let bt = BoardType.UNKNOWN;
    switch (revision) {
      case '0032':
      case '0003':
        bt = BoardType.MODEL1B_REV1;
        break;
      case '0004':
      case '0005':
      case '0006':
      case '000d':
      case '000e':
      case '000f':
        bt = BoardType.MODELB_REV2;
        break;
      default:
        break;
    }

    return bt;
  }

  /**
   * Gets the CPU temperature.
   * @returns The CPU temperature.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_temp") or response.
   */
  public static async getCpuTemperature() {
    // CPU temperature is in the form:
    // pi@mypi$ /opt/vc/bin/vcgencmd measure_temp
    // temp=42.3'C
    // Support for this was added around firmware version 3357xx per info
    // at http://www.raspberrypi.org/phpBB3/viewtopic.php?p=169909#p169909
    const result = await ExecUtils.executeCommand('/opt/vc/bin/vcgencmd measure_temp');
    if (!!result.length) {
      let val = -1;
      const separators = ['\\[', '\\=', '\\]', "\\'"];
      for (const line of result) {
        const parts = line.split(new RegExp(separators.join('|'), 'g'), 3);
        val = parseFloat(parts[1]);
        if (Number.isNaN(val)) {
          val = -1;
        }
      }

      return val;
    }

    throw new InvalidOperationException('Invalid command or response.');
  }

  /**
   * Gets the CPU voltage.
   * @returns The CPU voltage.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_volts") or response.
   */
  public static async getCpuVoltage() {
    return SystemInfo.getVoltage('core');
  }

  /**
   * Gets the memory voltage of SDRAM C.
   * @returns The memory voltage of SDRAM C.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_volts") or response.
   */
  public static async getMemoryVoltageSdramC() {
    return SystemInfo.getVoltage('sdram_c');
  }

  /**
   * Gets the memory voltage of SDRAM I.
   * @returns The memory voltage of SDRAM I.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_volts") or response.
   */
  public static async getMemoryVoltageSdramI() {
    return SystemInfo.getVoltage('sdram_i');
  }

  /**
   * Gets the memory voltage of SDRAM P.
   * @returns The memory voltage of SDARM P.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_volts") or response.
   */
  public static async getMemoryVoltageSdramP() {
    return SystemInfo.getVoltage('sdram_p');
  }

  /**
   * Determines if the H264 codec is enabled.
   * @returns true if H264 is enabled; Otherwise, false.
   * @throws [[InvalidOperationException]] if invalid command
   * ("codec_enabled") or response.
   */
  public static async isCodecH264Enabled() {
    return SystemInfo.getCodecEnabled('H264');
  }

  /**
   * Determines if the MPG2 codec is enabled.
   * @returns true if the MPG2 is enabled; Otherwise, false.
   * @throws [[InvalidOperationException]] if invalid command
   * ("codec_enabled") or response.
   */
  public static async isCodecMPG2Enabled() {
    return SystemInfo.getCodecEnabled('MPG2');
  }

  /**
   * Determines if the WVC1 codec is enabled.
   * @returns true if WVC1 is enabled; Otherwise, false.
   * @throws [[InvalidOperationException]] if invalid command
   * ("codec_enabled") or response.
   */
  public static async isCodecWVC1Enabled() {
    return SystemInfo.getCodecEnabled('WVC1');
  }

  /**
   * Gets the clock frequency for the specified target.
   * @param target The target clock to get the frequency of.
   * @returns The clock frequency, if successful; Otherwise, -1.
   */
  public static async getClockFrequency(target: ClockType) {
    let val = -1;
    const cmd = `/opt/vc/bin/vcgencmd measure_clock ${target}`;
    const result = await ExecUtils.executeCommand(cmd);
    if (!!result.length) {
      let temp = -1;
      let parts: string[] = [];
      for (const line of result) {
        parts = line.split('=', 2);
        temp = parseFloat(StringUtils.trim(parts[1]));
        if (!Number.isNaN(temp)) {
          val = temp;
          break;
        }
      }
    }

    return val;
  }

  /**
   * Determines if is hard float ABI.
   * @returns true if is hard float ABI; Otherwise, false.
   */
  public static async isHardFloatABI() {
    const bashInfo = await SystemInfo.getBashVersionInfo();
    const hasTag = await SystemInfo.hasReadElfTag('Tag_ABI_HardFP_use');
    return StringUtils.contains(bashInfo, 'gnueabihf') && hasTag;
  }

  /**
   * Gets the current system time in milliseconds.
   * @returns The current time millis.
   */
  public static getCurrentTimeMillis() {
    return new Date().getMilliseconds();
  }

  private static cpuInfo: any | null = null;

  /**
   * Gets the system memory info.
   * @returns The memory info.
   * @private
   */
  private static async getMemory() {
    const values: number[] = [];

    const result = await ExecUtils.executeCommand('free -b');
    if (!!result.length) {
      let linePart = StringUtils.EMPTY;
      let parts: string[] = [];
      for (const line of result) {
        if (StringUtils.startsWith(line, 'Mem:')) {
          parts = line.split(StringUtils.DEFAULT_PAD_CHAR);
          for (const j of parts) {
            linePart = StringUtils.trim(j);
            if (!StringUtils.isNullOrEmpty(linePart) && linePart !== 'Mem:') {
              values.push(parseFloat(linePart));
            }
          }
        }
      }
    }

    return values;
  }

  /**
   * Gets the voltage.
   * @param id The ID of the voltage type to get (core, sdram_c, etc).
   * @returns The voltage value.
   * @throws [[InvalidOperationException]] if invalid command
   * ("measure_volts") or response.
   * @private
   */
  private static async getVoltage(id: string) {
    const result = await ExecUtils.executeCommand(`/opt/vc/bin/vcgencmd measure_volts ${id}`);
    if (!!result.length) {
      let val = -1;
      const separators = ['\\[', '\\=', '\\]', "\\'"];
      for (const line of result) {
        const parts = line.split(new RegExp(separators.join('|'), 'g'), 3);
        const temp = parseFloat(parts[1]);
        if (!Number.isNaN(val)) {
          val = temp;
          break;
        }
      }

      return val;
    }

    throw new InvalidOperationException('Invalid command or response.');
  }

  /**
   * Gets whether or not the specified codec is enabled.
   * @param codec The codec to get.
   * @returns true if the codec is enabled; Otherwise, false.
   * @throws [[InvalidOperationException]] if invalid command
   * ("codec_enabled") or response.
   * @private
   */
  private static async getCodecEnabled(codec: string) {
    let enabled = false;
    const result = await ExecUtils.executeCommand(`/opt/vc/bin/vcgencmd codec_enabled ${codec}`);
    if (!!result.length) {
      let parts: string[] = [];
      for (const line of result) {
        parts = line.split('=', 2);
        if (StringUtils.trim(parts[1]).toUpperCase() === 'ENABLED') {
          enabled = true;
          break;
        }
      }
    }

    return enabled;
  }

  /**
   * Gets the BaSH version info. This method is used to help determine the
   * HARD-FLOAT / SOFT-FLOAT ABI of the system.
   * @returns The BaSH version info.
   * @private
   */
  private static async getBashVersionInfo() {
    let ver = StringUtils.EMPTY;

    try {
      const result = await ExecUtils.executeCommand('bash --version');
      const line = result[0];
      if (!StringUtils.isNullOrEmpty(line)) {
        ver = line;
      }
    } catch (e) {
      // ignore
    }

    return ver;
  }

  /**
   * This method will obtain a specified tag value from the ELF info in the
   * '/proc/self/exe' program (this method is used to help determine the
   * HARD-FLOAT / SOFT-FLOAT ABI of the system).
   * @param tag The tag to get the value of.
   * @returns The ABI tag value.
   * @private
   */
  private static async getReadElfTag(tag: string) {
    let tagVal = StringUtils.EMPTY;

    try {
      const cmd = '/usr/bin/readelf -A /proc/self/exe';
      const result = await ExecUtils.executeCommand(cmd);
      if (!!result.length) {
        for (const line of result) {
          const part = StringUtils.trim(line);
          if (StringUtils.startsWith(part, tag) && StringUtils.contains(part, ':')) {
            const lineParts = part.split(':', 2);
            if (lineParts.length > 1) {
              tagVal = StringUtils.trim(lineParts[1]);
            }

            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return tagVal;
  }

  /**
   * This method will determine if a specified tag exists from the ELF info in the
   * '/proc/self/exe' program (this method is used to help determine the
   * HARD-FLOAT / SOFT-FLOAT ABI of the system).
   * @param tag The tag to check for.
   * @returns true if contains the specified ELF tag.
   * @private
   */
  private static async hasReadElfTag(tag: string) {
    const tagVal = await SystemInfo.getReadElfTag(tag);
    return !StringUtils.isNullOrEmpty(tagVal);
  }

  private constructor() {}
}
