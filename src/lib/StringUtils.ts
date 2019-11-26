import * as util from 'util';

/**
 * @classdesc Provides utility methods and constants for working with strings.
 */
export default class StringUtils {
  /**
   * The default padding character.
   * @constant
   */
  public static readonly DEFAULT_PAD_CHAR = ' ';

  /**
   * Represents an empty string.
   * @constant
   */
  public static readonly EMPTY = '';

  /**
   * Creates a string from the specified character or string.
   * @param c      The character or string to create the string from. If
   * null or an empty string, then DEFAULT_PAD_CHAR is used instead.
   * @param length The number of instances or the specified character
   * or string to construct the string from.
   * @return        The constructed string.
   */
  public static create(c: string | undefined | null, length: number) {
    if (util.isNullOrUndefined(c) || c === StringUtils.EMPTY) {
      c = StringUtils.DEFAULT_PAD_CHAR;
    }

    let sb = '';
    for (let i = 0; i < length; i++) {
      sb += c;
    }

    return sb;
  }

  /**
   * Pads the left side of the specified string.
   * @param data   The string to pad.
   * @param pad    The character or string to pad the specified string
   * with. If null or empty string, then DEFAULT_PAD_CHAR will be used instead.
   * @param length The number of pad characters or instances of string
   * to inject.
   * @return        The padded version of the string.
   */
  public static padLeft(data: string, pad: string | undefined | null, length: number) {
    if (util.isNullOrUndefined(pad) || pad === StringUtils.EMPTY) {
      pad = StringUtils.DEFAULT_PAD_CHAR;
    }

    let sb = StringUtils.EMPTY;
    for (let i = 0; i < length; i++) {
      sb += pad;
    }

    sb += data;
    return sb;
  }

  /**
   * Pads the righ side of the specified string.
   * @param data   The string to pad.
   * @param pad    The character or string to pad the specified string
   * with. If null or empty string, DEFAULT_PAD_CHAR will be used instead.
   * @param length The number of padding characters or instances of
   * string to use.
   * @return        The padded version of the string.
   */
  public static padRight(data: string, pad: string | undefined | null, length: number) {
    if (util.isNullOrUndefined(pad) || pad === StringUtils.EMPTY) {
      pad = StringUtils.DEFAULT_PAD_CHAR;
    }

    let sb = data;
    for (let i = 0; i < length; i++) {
      sb += pad;
    }

    return sb;
  }

  /**
   * Pads the specified string on both sides.
   * @param data   The string to pad.
   * @param pad    The character or string to pad the specified string
   * with. If null or empty string, DEFAULT_PAD_CHAR will be used instead.
   * @param length The number of characters or instances of string to
   * pad on both sides.
   * @return         The padded version of the string.
   */
  public static pad(data: string, pad: string | undefined | null, length: number) {
    if (util.isNullOrUndefined(pad) || pad === StringUtils.EMPTY) {
      pad = StringUtils.DEFAULT_PAD_CHAR;
    }

    const p = StringUtils.create(pad, length);
    return `${p}${data}${p}`;
  }

  /**
   * Pads the center of the specified string.
   * @param data   The string to pad.
   * @param pad    The character or string to pad the center of the
   * specified string with. If null or empty string, DEFAULT_PAD_CHAR will be
   * used instead.
   * @param length The number of characters or instances of string to
   * pad the center with.
   * @return       The padded version of the string.
   */
  public static padCenter(data: string, pad: string | undefined | null, length: number) {
    if (util.isNullOrUndefined(pad) || pad === StringUtils.EMPTY) {
      pad = StringUtils.DEFAULT_PAD_CHAR;
    }

    if (data.length > 2 && length > 0) {
      const firstHalf = data.substring(0, data.length / 2);
      const secondHalf = data.substring(data.length / 2, data.length);
      const padStr = StringUtils.create(pad, length);
      return `${firstHalf}${padStr}${secondHalf}`;
    }

    return data;
  }

  /**
   * Checks to see if the specified string ends with the specified suffix.
   * @param data   The string to check.
   * @param suffix The suffix to search the specified string for.
   * @return        true if the string ends with the specified suffix;
   * Otherwise, false.
   */
  public static endsWith(data: string, suffix: string) {
    return data.indexOf(suffix, data.length - suffix.length) !== -1;
  }

  /**
   * Checks to see if the specified string begins with the specified prefix.
   * @param data   The string to check.
   * @param prefix The prefix to search the specified string for.
   * @return      true if the string starts with the specified suffix;
   * Otherwise, false.
   */
  public static startsWith(data: string, prefix: string) {
    return data.indexOf(prefix, 0) === 0;
  }

  /**
   * Checks to see if the specified string is null or empty.
   * @param data The string object to inspect.
   * @return   true if the specified string is null or empty;
   * Otherwise, false.
   */
  public static isNullOrEmpty(data: string | undefined | null) {
    if (util.isNullOrUndefined(data) || data.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Trims whitespace from the beginning and end of the specified string.
   * @param data The string to trim.
   * @return     The resulting (trimmed) string.
   */
  public static trim(data: string | undefined | null) {
    if (util.isNullOrUndefined(data)) {
      return StringUtils.EMPTY;
    }

    if (StringUtils.isNullOrEmpty(data)) {
      return StringUtils.EMPTY;
    }

    return data.replace(/^\s+|\s+$/gm, '');
  }

  /**
   * Checks to see if the specified string contains the specified substring.
   * @param data    The string to check.
   * @param substr The string to search for.
   * @return       true if at least one instance of the specified
   * substring was found within the specified string.
   */
  public static contains(data: string, substr: string) {
    return data.indexOf(substr) > -1;
  }

  /**
   * Coverts a string value to a byte value.
   * @param data A string representing a byte value (ie. "00000000").
   * @return    The byte value.
   */
  public static convertStringToByte(data: string) {
    let ch: number = 0;
    let st: number[] = [];
    let re: number[] = [];
    for (let i = 0; i < data.length; i++) {
      st = [];
      ch = data.charCodeAt(i);
      while (ch) {
        st.push(ch & 0xff);
        ch >>= 8;
      }

      re = re.concat(st.reverse());
    }

    return re;
  }
}
