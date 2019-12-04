import * as exec from 'child_process';
import * as util from 'util';
import StringUtils from './StringUtils';

/**
 * @classdesc Provides utility methods for executing child processes and
 * retrieving the process output.
 */
export default class ExecUtils {
  /**
   * Executes the specified command string.
   * @param command The command to execute.
   * @return        A string array containing each line of the output.
   */
  public static async executeCommand(command: string | null | undefined) {
    if (util.isNullOrUndefined(command)) {
      return [];
    }

    let args = StringUtils.EMPTY;
    const cmdLine = command.split(StringUtils.DEFAULT_PAD_CHAR);
    if (cmdLine.length > 1) {
      command = cmdLine[0];
      for (let i = 1; i <= cmdLine.length - 1; i++) {
        args = `${args}${cmdLine[i]} `;
      }

      if (StringUtils.endsWith(args, StringUtils.DEFAULT_PAD_CHAR)) {
        args = args.substring(0, args.length - 1);
      }
    }

    let result: string[] = [];
    const cmdSpawn = exec.spawnSync(command, args.split(StringUtils.DEFAULT_PAD_CHAR));
    if (cmdSpawn.status === 0) {
      if (typeof cmdSpawn.stdout === 'string') {
        result = (cmdSpawn.stdout as string).split('\n');
      } else {
        result = (cmdSpawn.stdout as Buffer).toString().split('\n');
      }
    }

    return result;
  }
}
