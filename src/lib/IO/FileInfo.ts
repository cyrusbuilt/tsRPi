import * as FS from 'fs';
import * as Path from 'path';
import IllegalArgumentException from '../IllegalArgumentException';
import StringUtils from '../StringUtils';
import IOException from './IOException';

/**
 * @classdesc A file object. This represents a file specifically, and not a
 * directory or other container.
 */
export default class FileInfo {
  private name: string;
  private originalPath: string;
  private fullPath: string;

  /**
   * Initializes a new instance of the jsrpi.IO.FileInfo class with the
   * fully-qualified or relative name of the file or directory.
   * @param filePath The fully qualified name of the new file, or the
   * relative file name.
   * @throws [[IllegalArgumentException]] if filePath is null or undefined.
   * @constructor
   */
  constructor(filePath: string) {
    if (StringUtils.isNullOrEmpty(filePath)) {
      throw new IllegalArgumentException('filePath cannot be empty.');
    }

    this.name = Path.basename(filePath);
    this.originalPath = filePath;
    this.fullPath = Path.normalize(this.originalPath);
  }

  /**
   * Gets the path as a string.
   * @return A string representing the file path.
   * @override
   */
  public toString() {
    return this.originalPath;
  }

  /**
   * Checks to see if this file exists.
   * @return true if exists; Otherwise, false.
   */
  public async exists() {
    const result = FS.existsSync(this.fullPath);
    return result;
  }

  /**
   * Gets the directory name (path) the file is in.
   * @return The directory component of the path.
   */
  public getDirectoryName() {
    return Path.dirname(this.fullPath);
  }

  /**
   * Gets the file name.
   * @return The file name component of the full file path.
   */
  public getFileName() {
    return this.name;
  }

  /**
   * Gets the file extension name.
   * @return The file extension (ie. "txt" or "pdf").
   */
  public getFileExtension() {
    return Path.extname(this.name).substring(1);
  }

  /**
   * Deletes this file.
   * @throws [[IOException]] if an error occurred while trying to delete the
   * file (such as if the file does not exist).
   */
  public async delete() {
    try {
      FS.unlinkSync(this.fullPath);
    } catch (e) {
      throw new IOException(e.message);
    }
  }

  /**
   * Gets the file size in bytes.
   * @return The file size in bytes if it exists; Otherwise, zero. May
   * also return zero if this is a zero byte file.
   */
  public async getLength() {
    const doesExist = await this.exists();
    if (!doesExist) {
      return 0;
    }

    const stats = FS.statSync(this.fullPath);
    return stats.size;
  }

  /**
   * Gets the file name, without the file extension.
   * @return The file name without file extension.
   */
  public getFileNameWithoutExtension() {
    const extLen = Path.extname(this.name).length;
    return this.name.substring(0, this.name.length - extLen);
  }

  /**
   * Gets the full file name path (dir + name + extension).
   * @return The full file path.
   */
  public getFullName() {
    return this.fullPath;
  }
}
