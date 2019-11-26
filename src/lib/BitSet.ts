import * as Assert from 'assert';
import * as Util from 'util';
import IllegalArgumentException from './IllegalArgumentException';

/**
 * The number of address bits per word.
 * @constant
 */
const ADDRESS_BITS_PER_WORD = 6;

/**
 * The number of bits per word.
 * @constant
 */
const BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;

/**
 * @classdesc
 * An implementation of a vector of bits that grows as needed. Each component of
 * the bit set has a Boolean value. The bits of a BitSet are indexed by
 * non-negative integers. Individual indexed bits can be examined, set, or
 * cleared. One BitSet may be used to modify the contents of another through
 * logical AND, logical inclusive OR, and logical exclusive OR operations. By
 * default, all bits in the set initially have the value of false. Every BitSet
 * has a current size, which is the number of bits of space currently in use by
 * the BitSet. Note that the size is related to the implementation of a BitSet,
 * so it may change with implementation. The length of a BitSet relates to the
 * logical length of a BitSet and is defined independently of implementation.
 * Unless otherwise noted, passing a null parameter to any of the methods in a
 * BitSet will result in a ArgumentNullException.
 */
export default class BitSet {
  /**
   * The bit index mask.
   * @constant
   */
  public static readonly BIT_INDEX_MASK = BITS_PER_WORD - 1;

  /**
   * The long mask.
   * @constant
   */
  public static readonly LONG_MASK = 0x3f;

  /**
   * Given the specified bit index, returns the word index containing it.
   * @param bitIndex The bit index.
   * @return The word index containing the specified bit index.
   */
  public static wordIndex(bitIndex: number) {
    return bitIndex >> ADDRESS_BITS_PER_WORD;
  }

  /**
   * Checks to see if the specified "from" index and "to" index are a valid range
   * of bit indices and throws an exception if not.
   * @param fromIndex The starting index.
   * @param toIndex The ending index.
   * @throws [[RangeError]] if either parameter is less than zero or if the
   * from index is greater than the to index.
   */
  public static checkRange(fromIndex: number, toIndex: number) {
    if (fromIndex < 0) {
      throw new RangeError('fromIndex cannot be less than zero.');
    }

    if (toIndex < 0) {
      throw new RangeError('toIndex cannot be less than zero.');
    }

    if (fromIndex > toIndex) {
      throw new RangeError('fromIndex cannot be greater than toIndex.');
    }
  }

  /**
   * Gets the number of trailing zeros in the specified number.
   * @param n The number value to inspect.
   * @return The number of trailing zeros.
   */
  public static numberOfTrailingZeros(n: number) {
    let mask = 1;
    let result = 64;
    for (let i = 0; i < 64; i++, mask <<= 1) {
      if ((n & mask) !== 0) {
        result = i;
        break;
      }
    }

    return result;
  }

  /**
   * Gets a new BitSet from the specified word array.
   * @param words An array of bits to convert into a BitSet.
   * @return [[BitSet]] a new BitSet containing the specified bits.
   */
  public static fromWordArray(words: number[]) {
    return new BitSet(words);
  }

  /**
   * Returns a new BitSet containing all the bits in the specified array of
   * numbers (bits).
   * @param words The array of bits to construct a BitSet from. If null,
   * then this function will return null.
   * @return [[BitSet]] a new BitSet containing the specified array of bits.
   */
  public static valueOf(words: number[]) {
    let n = 0;
    for (n = words.length; n > 0 && words[n - 1] === 0; n--) {
      // TODO What should we be checking here?
    }

    const wordsCopy = (words || []).concat();
    return new BitSet(wordsCopy);
  }

  /**
   * The class name.
   */
  public name: string;

  private bits: number[];
  private wordsInUse: number;
  private sizeIsSticky: boolean;

  /**
   * Initializes a new instance of [[BitSet]].
   * @param bits Either a number of bits to populate or an array of bits to use.
   * If null or undefined, then a default bit array will be used.
   * @throws [[RangeError]] if 'bits' param must not be negative.
   * @throws [[IllegalArgumentException]] param 'bits' must be a number
   * or an array of bits.
   */
  constructor(bits: number | number[] | null | undefined) {
    this.bits = [];
    this.wordsInUse = 0;
    this.sizeIsSticky = false;
    this.name = 'BitSet';

    if (Util.isNullOrUndefined(bits)) {
      this.bits = new Array(BITS_PER_WORD);
    } else {
      if (typeof bits === 'number') {
        if (bits < 0) {
          throw new RangeError("'bits' param must not be negative.");
        }

        this.bits = new Array(BitSet.wordIndex(bits - 1) + 1);
        this.sizeIsSticky = true;
      } else if (Util.isArray(bits)) {
        this.bits = bits;
        this.wordsInUse = this.bits.length;
        this.checkInvariants();
      } else {
        throw new IllegalArgumentException("param 'bits' must be a number or an array of bits.");
      }
    }
  }

  /**
   * @property true if empty; Otherwise, false.
   */
  get isEmpty() {
    return this.wordsInUse === 0;
  }

  /**
   * @property Returns the logical size of this BitSet or zero
   * if this instance contains no bits.
   */
  get length() {
    if (this.isEmpty) {
      return 0;
    }

    if (this.bits.length === 0) {
      this.wordsInUse = 0;
      return this.wordsInUse;
    }

    const positions = BitSet.numberOfTrailingZeros(this.bits[this.wordsInUse - 1]);
    return BITS_PER_WORD * (this.wordsInUse - 1) + (BITS_PER_WORD - positions);
  }

  /**
   * @property Returns The maximum element in the set is the
   * size minus the first element.
   */
  get size() {
    return this.bits.length * BITS_PER_WORD;
  }

  /**
   * Gets the number of words in use.
   * @return The number of words in use.
   */
  public getWordsInUse() {
    return this.wordsInUse;
  }

  /**
   * Gets the internal bit array.
   * @return The internal bit array.
   */
  public getBits() {
    return this.bits;
  }

  /**
   * @property The number of bits set true.
   */
  public get cardinality(): number {
    let card = 0;
    let a = 0;
    let b = 0;

    for (let i = this.bits.length - 1; i >= 0; i--) {
      // Take care of common cases.
      a = this.bits[i];
      if (a === 0) {
        continue;
      }

      if (a === -1) {
        card += 64;
        continue;
      }

      // Successively collapse alternating bit groups into a sum.
      a = ((a >> 1) & 0x5555555555555555) + (a & 0x5555555555555555);
      a = ((a >> 2) & 0x3333333333333333) + (a & 0x3333333333333333);
      b = (a >> 32) + a;
      b = ((b >> 4) & 0x0f0f0f0f) + (b & 0x0f0f0f0f);
      b = ((b >> 8) & 0x00ff00ff) + (b & 0x00ff00ff);
      card += ((b >> 16) & 0x0000ffff) + (b & 0x0000ffff);
    }

    return card;
  }

  /**
   * Performs a logical AND of this target BitSet with the argument BitSet. This
   * BitSet is modified so that each bit in it has the value ture if (and only
   * if) it both initially had the value true and the corresponding bit in the
   * specified BitSet also had the value true.
   * @param bs A BitSet.
   */
  public and(bs: BitSet) {
    if (this === bs) {
      return;
    }

    while (this.wordsInUse > bs.getWordsInUse()) {
      this.bits[--this.wordsInUse] = 0;
    }

    for (let i = 0; i < this.wordsInUse; i++) {
      this.bits[i] &= bs.getBits()[i];
    }

    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Clears all of the bits in this BitSet whose corresponding bit is set in the
   * specified BitSet.
   * @param bs The BitSet with which to mask this instance.
   */
  public andNot(bs: BitSet) {
    let i = Math.min(this.bits.length, bs.getBits().length);
    while (--i >= 0) {
      this.bits[i] &= ~bs.getBits()[i];
    }

    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Performs a logical OR of this BitSet with the specified BitSet. This BitSet
   * is modified so that a bit in it has the value true if (and only if) it
   * either already had the value ture or the corresponding bit in the specified
   * BitSet has the value true.
   * @param bs A BitSet.
   */
  public or(bs: BitSet) {
    if (this === bs) {
      return;
    }

    if (this.wordsInUse < bs.getWordsInUse()) {
      this.ensureCapacity(bs.getWordsInUse());
      this.wordsInUse = bs.getWordsInUse();
    }

    // Calculate how many words which have in common with the other bit set.
    const wordsInCommon = Math.min(this.wordsInUse, bs.getWordsInUse());
    for (let i = 0; i < wordsInCommon; i++) {
      this.bits[i] |= bs.getBits()[i];
    }

    if (wordsInCommon < bs.getWordsInUse()) {
      this.bits = (this.bits || []).concat().slice(0, this.wordsInUse - wordsInCommon);
    }

    this.checkInvariants();
  }

  /**
   * Performs a logical XOR of this BitSet with the specified BitSet. This
   * BitSet is modified so that bit in it has the value true if (and only if)
   * one of the following statements holds true:
   * - The bit initially has the value true, and the corresponding bit in the
   * specified BitSet has the value false.
   * - The bit initially has the value false, and the corresponding bit in the
   * specified BitSet has the value true.
   * @param bs A BitSet.
   */
  public xOr(bs: BitSet) {
    if (this.wordsInUse < bs.getWordsInUse()) {
      this.ensureCapacity(bs.getWordsInUse());
      this.wordsInUse = bs.getWordsInUse();
    }

    // Calculate how many words which have in common with the other bit set.
    const wordsInCommon = Math.min(this.wordsInUse, bs.getWordsInUse());
    for (let i = 0; i < wordsInCommon; i++) {
      // Perform logical XOR on words in common.
      this.bits[i] ^= bs.getBits()[i];
    }

    // Copy any remaining words.
    if (wordsInCommon < bs.getWordsInUse()) {
      this.bits = (this.bits || []).concat().slice(0, bs.getWordsInUse() - wordsInCommon);
    }

    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Sets the bit at the specified position (index) to false, or clears the
   * entire BitSet if no value given.
   * @param pos The index of the bit to be cleared. If null or less
   * than one, clears the entire BitSet.
   * @throws [[RangeError]] if pos is greater than the last index.
   */
  public clear(pos: number) {
    if (pos < 1) {
      for (let i = 0; i < this.bits.length; i++) {
        this.bits[i] = 0;
      }

      this.wordsInUse = 0;
    } else {
      if (pos > this.bits.length - 1) {
        throw new RangeError("param 'pos' cannot be greater than the last index.");
      }

      const offset = BitSet.wordIndex(pos);
      if (offset >= this.wordsInUse) {
        return;
      }

      this.bits[offset] &= ~(1 << pos);
      this.recalculateWordsInUse();
      this.checkInvariants();
    }
  }

  /**
   * Sets the bits from the specified 'from' index (inclusive) to the specified
   * 'to' index (exclusive) to false.
   * @param fromIndex The starting index. Throws [[RangeError]]
   * if less than zero or greater than toIndex.
   * @param toIndex The ending index. Throws [[RangeError]] if
   * less than zero.
   * @throws [[RangeError]] if either parameter is less than zero.
   */
  public clearFromTo(fromIndex: number, toIndex: number) {
    BitSet.checkRange(fromIndex, toIndex);
    if (fromIndex === toIndex) {
      return;
    }

    const startWordIndex = BitSet.wordIndex(fromIndex);
    if (startWordIndex >= this.wordsInUse) {
      return;
    }

    let endWordIndex = BitSet.wordIndex(toIndex - 1);
    if (endWordIndex >= this.wordsInUse) {
      toIndex = this.length;
      endWordIndex = this.wordsInUse - 1;
    }

    const firstWordMask = BitSet.LONG_MASK << fromIndex;
    const lastWordMask = BitSet.LONG_MASK >> -toIndex;
    if (startWordIndex === endWordIndex) {
      // Case 1: single word.
      this.bits[startWordIndex] &= ~(firstWordMask & lastWordMask);
    } else {
      // Case 2: multiple words.
      // Handle first word.
      this.bits[startWordIndex] &= ~firstWordMask;

      // Handle intermediate words, if any.
      for (let i = startWordIndex + 1; i < endWordIndex; i++) {
        this.bits[i] = 0;
      }

      // Handle last word.
      this.bits[endWordIndex] &= ~lastWordMask;
    }

    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Every public method must preserve invariants. This method checks to see if
   * this is true using assertions. Assertion errors are thrown if any of the
   * assertions fail.
   */
  public checkInvariants() {
    Assert.ok(this.wordsInUse === 0 || this.bits[this.wordsInUse - 1] !== 0);
    Assert.ok(this.wordsInUse >= 0 && this.wordsInUse <= this.bits.length);
    Assert.ok(this.wordsInUse === this.bits.length || this.bits[this.wordsInUse] === 0);
  }

  /**
   * Creates a new object that is a copy of the current instance.
   * @return A new BitSet that is a copy of this instance.
   */
  public clone() {
    if (this.sizeIsSticky) {
      this.trimToSize();
    }

    try {
      return BitSet.fromWordArray(this.bits);
    } catch (e) {
      return null;
    }
  }

  /**
   * Determines whether the specified object is equal to the current BitSet.
   * @param obj The object to compare with the current BitSet.
   * Generally, this method should be used to check against other BitSet
   * instances.
   * @return true if equal; Otherwise, false.
   */
  public equals(obj: any | null | undefined) {
    if (Util.isNullOrUndefined(obj)) {
      return false;
    }

    if (!(obj instanceof BitSet)) {
      return false;
    }

    this.checkInvariants();
    obj.checkInvariants();

    if (this.wordsInUse !== obj.getWordsInUse()) {
      return false;
    }

    let result = true;
    for (let i = 0; i < this.wordsInUse; i++) {
      if (this.bits[i] !== obj.getBits()[i]) {
        result = false;
        break;
      }
    }

    return result;
  }

  /**
   * Sets the bit at the specified index to the compliment of its current value.
   * @param index The index of the bit to flip.
   * @throws [[RangeError]] if index is less than zero.
   */
  public flip(index: number) {
    if (index < 0) {
      throw new RangeError('index cannot be less than zero.');
    }

    const offset = BitSet.wordIndex(index);
    this.expandTo(offset);
    this.bits[offset] ^= 1 << index;
    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Sets each bit from the specified "from" (inclusive) index to the specified
   * "to" (exclusive) index to the compliment of its current value.
   * @param fromIndex The starting index. This is the first bit to flip.
   * @param toIndex The ending index. This is the index after the
   * last bit to flip.
   * @throws [[RangeError]] if either parameter is less than zero.
   */
  public flipFromTo(fromIndex: number, toIndex: number) {
    BitSet.checkRange(fromIndex, toIndex);
    if (fromIndex === toIndex) {
      return;
    }

    const startWordIndex = BitSet.wordIndex(fromIndex);
    const lastWordIndex = BitSet.wordIndex(toIndex - 1);
    this.expandTo(lastWordIndex);

    const firstWordMask = BitSet.LONG_MASK << fromIndex;
    const lastWordMask = BitSet.LONG_MASK >> -toIndex;
    if (startWordIndex === lastWordIndex) {
      this.bits[startWordIndex] ^= firstWordMask & lastWordMask;
    } else {
      this.bits[startWordIndex] ^= firstWordMask;
      for (let i = startWordIndex + 1; i < lastWordIndex; i++) {
        this.bits[i] ^= BitSet.LONG_MASK;
      }

      this.bits[lastWordIndex] ^= lastWordMask;
    }

    this.recalculateWordsInUse();
    this.checkInvariants();
  }

  /**
   * Sets the raw bit value at the specified index. Avoid using this method
   * whenever possible. Instead use either set() or setFromTo() so as to
   * preserve invariants.
   * @param index The index at which to set the specified bit.
   * @param bit Set true or 1 to set the bit, or false or 0
   * to clear the bit.
   * @throws [[IllegalArgumentException]] if index is not a number - or - bit is
   * is not a number (0 or 1) or boolean.
   * @throws [[RangeError]] if index is less than zero or greater than the last
   * index.
   */
  public setBitValue(index: number, bit: number | boolean) {
    if (index < 0 || index > this.bits.length - 1) {
      throw new RangeError(
        'index must be greater than zero and less than or ' + 'equal to the last index in the bit set.',
      );
    }

    if (typeof bit === 'number') {
      if (bit < 0) {
        bit = 0;
      }

      if (bit > 1) {
        bit = 1;
      }
    } else if (typeof bit === 'boolean') {
      if (bit === true) {
        bit = 1;
      } else {
        bit = 0;
      }
    } else {
      throw new IllegalArgumentException('bit must be a number (0 or 1) or boolean.');
    }

    this.bits[index] = bit;
  }

  /**
   * Gets the value of the bit at the specified index.
   * @param index The index at which to get the bit value.
   * @return true if the requested bit is set; Otherwise, false.
   * @throws [[RangeError]] if index is less than zero.
   */
  public get(index: number) {
    if (index < 0) {
      throw new RangeError('index cannot be less than zero.');
    }

    this.checkInvariants();
    const offset = BitSet.wordIndex(index);
    return offset < this.wordsInUse && (this.bits[index] & (1 << index)) !== 0;
  }

  /**
   * Sets the internal word count field to the logical size in words of the
   * BitSet. WARNING: This method assumes that the number of words actually in
   * use is less than or equal to the current value of the words in use field!!!
   */
  public recalculateWordsInUse() {
    let i = 0;
    for (i = this.wordsInUse - 1; i >= 0; i--) {
      if (this.bits[i] !== 0) {
        break;
      }
    }

    this.wordsInUse = i + 1;
  }

  /**
   * Returns a new BitSet composed of bits from this BitSet from the specified
   * the specified "from" (inclusive) index to the specified "to" (exclusive)
   * index.
   * @param fromIndex The starting index. This is the first bit to include.
   * @param toIndex The ending index. This is the index after the
   * last bit to include.
   * @throws [[RangeError]] if either parameter is less than zero.
   */
  public getFromTo(fromIndex: number, toIndex: number) {
    BitSet.checkRange(fromIndex, toIndex);
    this.checkInvariants();

    // If no set bits in range, then return the empty BitSet.
    if (this.length <= fromIndex || fromIndex === toIndex) {
      return BitSet.fromWordArray(new Array(0));
    }

    // Optimize
    if (toIndex > this.length) {
      toIndex = this.length;
    }

    const bs = new BitSet(toIndex - fromIndex);
    const targetWords = BitSet.wordIndex(toIndex - fromIndex - 1) + 1;
    let sourceIndex = BitSet.wordIndex(fromIndex);
    const aligned = (fromIndex & BitSet.BIT_INDEX_MASK) === 0;

    // Process all words but the last one.
    let setBit = 0;
    for (let i = 0; i < targetWords - 1; i++, sourceIndex++) {
      setBit = aligned
        ? this.bits[sourceIndex]
        : (this.bits[sourceIndex] >> fromIndex) | (this.bits[sourceIndex + 1] << -fromIndex);
      bs.setBitValue(i, setBit);
    }

    // Process last word.
    const lastWordMask = BitSet.LONG_MASK >> -toIndex;
    setBit =
      ((toIndex - 1) & BitSet.BIT_INDEX_MASK) < (fromIndex & BitSet.BIT_INDEX_MASK)
        ? (this.bits[sourceIndex] >> fromIndex) | ((this.bits[sourceIndex + 1] & lastWordMask) << -fromIndex)
        : (this.bits[sourceIndex] & lastWordMask) >> fromIndex;

    bs.setBitValue(targetWords - 1, setBit);
    bs.checkInvariants();
    bs.recalculateWordsInUse();
    return bs;
  }

  /**
   * Sets the bit at the specified index to true.
   * @param index The index at which to set the bit.
   * @throws [[RangeError]] if index is less than zero.
   */
  public set(index: number) {
    if (index < 0) {
      throw new RangeError('index cannot be less than zero.');
    }

    const offset = BitSet.wordIndex(index);
    this.expandTo(offset);
    this.bits[offset] |= 1 << index; // Restores invariants.
    this.checkInvariants();
  }

  /**
   * Sets the bit at the specified index to the specified value.
   * @param index The index at which to set the bit.
   * @param value The value to set.
   * @throws [[RangeError]] if index is less than zero.
   */
  public setValue(index: number, value: number) {
    if (value) {
      this.set(index);
    } else {
      this.clear(index);
    }
  }

  /**
   * Sets the bits from the specified "from" index (inclusive) to the specified
   * "to" index (exclusive) to true.
   * @param fromIndex The starting index. This is the first bit to set.
   * @param toIndex The ending index. This is the index after the
   * last bit to set.
   * @throws [[RangeError]] if index is less than zero.
   */
  public setFromTo(fromIndex: number, toIndex: number) {
    BitSet.checkRange(fromIndex, toIndex);
    if (fromIndex === toIndex) {
      return;
    }

    const startWordIndex = BitSet.wordIndex(fromIndex);
    const endWordIndex = BitSet.wordIndex(toIndex - 1);
    this.expandTo(endWordIndex);

    const firstWordMask = BitSet.LONG_MASK << fromIndex;
    const lastWordMask = BitSet.LONG_MASK >> -toIndex;
    if (startWordIndex === endWordIndex) {
      this.bits[startWordIndex] |= firstWordMask & lastWordMask;
    } else {
      this.bits[startWordIndex] |= firstWordMask;
      for (let i = startWordIndex + 1; i < endWordIndex; i++) {
        this.bits[i] = BitSet.LONG_MASK;
      }

      this.bits[endWordIndex] |= lastWordMask;
    }

    this.checkInvariants();
  }

  /**
   * Sets the bits from the specified "from" index (inclusive) to the specified
   * "to" index (exclusive) to the specified value.
   * @param fromIndex The starting index. This is the first bit to set.
   * @param toIndex The ending index. This is the index after the
   * last bit to set.
   * @param value The value to set.
   * @throws [[RangeError]] if index is less than zero.
   */
  public setValueFromTo(fromIndex: number, toIndex: number, value: boolean) {
    if (value) {
      this.setFromTo(fromIndex, toIndex);
    } else {
      this.clearFromTo(fromIndex, toIndex);
    }
  }

  /**
   * Gets a hash code value for this BitSet. The hash code depends only on which
   * bits are set within this instance.
   * @return The hash code value for this BitSet.
   */
  public getHashCode() {
    let h = 1234;
    for (let i = this.bits.length; --i >= 0; ) {
      h ^= this.bits[i] * (i + 1);
    }

    return (h >> 32) ^ h;
  }

  /**
   * Determines whether or not the specified BitSet has any bits set to true
   * that are also set to true in this BitSet.
   * @param bs The BitSet to intersect with.
   * @return true if this instance intersects with the specified BitSet.
   */
  public intersects(bs: BitSet | undefined | null) {
    if (Util.isNullOrUndefined(bs)) {
      return false;
    }

    let goodBits = false;
    let i = Math.min(this.bits.length, bs.getBits().length);
    while (--i >= 0) {
      if ((this.bits[i] & bs.getBits()[i]) !== 0) {
        goodBits = true;
        break;
      }
    }

    return goodBits;
  }

  /**
   * Returns the index of the first bit that is set to false that occurs on or
   * after the specified starting index.
   * @param fromIndex The index to start checking from (inclusive).
   * @return The index of the next clear bit; Otherwise, -1
   * if no such bit is found.
   * @throws [[RangeError]] if fromIndex is less than zero.
   */
  public nextClearBit(fromIndex: number) {
    if (fromIndex < 0) {
      throw new RangeError("'fromIndex' cannot be less than zero.");
    }

    this.checkInvariants();
    let offset = BitSet.wordIndex(fromIndex);
    if (offset >= this.wordsInUse) {
      return fromIndex;
    }

    let result = -1;
    let w = ~this.bits[offset] & (BitSet.LONG_MASK << fromIndex);
    while (true) {
      if (w !== 0) {
        result = offset * BITS_PER_WORD + BitSet.numberOfTrailingZeros(w);
        break;
      }

      if (++offset === this.wordsInUse) {
        result = this.wordsInUse * BITS_PER_WORD;
        break;
      }

      w = ~this.bits[offset];
    }

    return result;
  }

  /**
   * Returns the index of the first bit that is set to true that occurs on or
   * after the specified starting index.
   * @param fromIndex The index to start checking from (inclusive).
   * Throws RangeError if less than zero.
   * @return The index of the next set bit after the
   * specified index. If no such bit exists, then returns -1.
   * @throws [[RangeError]] if fromIndex is less than zero.
   */
  public nextSetBit(fromIndex: number) {
    if (fromIndex < 0) {
      throw new RangeError("'fromIndex' cannot be less than zero.");
    }

    this.checkInvariants();
    let offset = BitSet.wordIndex(fromIndex);
    if (offset >= this.wordsInUse) {
      return -1;
    }

    let result = -1;
    let w = this.bits[offset] & (BitSet.LONG_MASK << fromIndex);
    while (true) {
      if (w !== 0) {
        result = offset * BITS_PER_WORD + BitSet.numberOfTrailingZeros(w);
        break;
      }

      if (++offset === this.wordsInUse) {
        break;
      }

      w = this.bits[offset];
    }

    return result;
  }

  /**
   * Returns the index of the nearest bit that is set to true that occurs on or
   * before the specified starting index.
   * @param fromIndex The index to start checking from (inclusive).
   * Throws RangeError if less than zero.
   * @return The index of the previous set bit, or -1 if
   * there is no such bit or if fromIndex is set to -1.
   * @throws [[RangeError]] if fromIndex is less than zero.
   */
  public previousSetBit(fromIndex: number) {
    if (fromIndex < 0) {
      if (fromIndex === -1) {
        return -1;
      }

      throw new RangeError("'fromIndex' cannot be less than zero.");
    }

    this.checkInvariants();
    let offset = BitSet.wordIndex(fromIndex);
    if (offset >= this.wordsInUse) {
      return this.length - 1;
    }

    let result = -1;
    let w = this.bits[offset] & (BitSet.LONG_MASK >> -(fromIndex + 1));
    while (true) {
      if (w !== 0) {
        result = (offset + 1) * BITS_PER_WORD - 1 - BitSet.numberOfTrailingZeros(w);
        break;
      }

      if (offset-- === 0) {
        break;
      }

      w = this.bits[offset];
    }

    return result;
  }

  /**
   * Returns the index of the nearest bit that is set to false that occurs on or
   * before the specified starting index.
   * @param fromIndex The index to start checking from (inclusive).
   * Throws RangeError if fromIndex is less than -1.
   * @return The index of the previous clear bit, or -1 if
   * there is no such bit or fromIndex is -1.
   * @throws [[RangeError]] if fromIndex is less than zero.
   */
  public previousClearBit(fromIndex: number) {
    if (fromIndex < 0) {
      if (fromIndex === -1) {
        return -1;
      }

      throw new RangeError("'fromIndex' cannot be less than zero.");
    }

    this.checkInvariants();
    let offset = BitSet.wordIndex(fromIndex);
    if (offset >= this.wordsInUse) {
      return fromIndex;
    }

    let result = -1;
    let w = ~this.bits[offset] & (BitSet.LONG_MASK >> -(fromIndex + 1));
    while (true) {
      if (w !== 0) {
        result = (offset + 1) * BITS_PER_WORD - 1 - BitSet.numberOfTrailingZeros(w);
        break;
      }

      if (offset-- === 0) {
        break;
      }

      w = ~this.bits[offset];
    }

    return result;
  }

  /**
   * This method is used for efficiency. It checks to see if this instance
   * contains all the same bits as the specified BitSet.
   * @param bs The BitSet to check.
   * @return true if the specified BitSet contains all the same
   * bits; Otherwise, false.
   */
  public containsAll(bs: BitSet | null | undefined) {
    if (Util.isNullOrUndefined(bs)) {
      return false;
    }

    let result = true;
    for (let i = 0; i < bs.getBits().length; i++) {
      if ((this.bits[i] & bs.getBits()[i]) !== bs.getBits()[i]) {
        result = false;
        break;
      }
    }

    return result;
  }

  /**
   * Returns a String that represents the current BitSet. For every index for
   * which this BitSet contains a bit in the set state, the decimal
   * representation of that index is included in the result. Such indices are
   * listed in order from lowest to highest, separated by a ", " (a comma and a
   * space) and surrounded by braces, resulting in the usual mathematical
   * notation for a set of integers.
   * @return A String that represents the current BitSet.
   */
  public toString() {
    let sb = '{';
    let first = true;
    let bit = 0;
    let word = 0;

    for (let i = 0; i < this.bits.length; ++i) {
      bit = 1;
      word = this.bits[i];
      if (word === 0) {
        continue;
      }

      for (let j = 0; j < 64; ++j) {
        if ((word & bit) !== 0) {
          if (!first) {
            sb += ', ';
          }

          sb += (64 * i + j).toString();
          first = false;
        }

        bit <<= 1;
      }
    }

    sb += '}';
    return sb;
  }

  /**
   * Returns a new array of bits containing all the bits in this BitSet.
   * @return An array of bits containing little-endian representation of
   * all the bits in this BitSet.
   */
  public toBitArray() {
    return (this.bits || []).concat();
  }

  /**
   * Ensures that this BitSet can hold enough words.
   * @param lastElt The minimum acceptable number of words.
   * @private
   */
  private ensureCapacity(lastElt: number) {
    if (lastElt >= this.bits.length) {
      this.bits = (this.bits || []).concat();
      this.sizeIsSticky = true;
    }
  }

  /**
   * Ensures that the BitSet can accomodate a given word index, temporarily
   * violating the invariants. The caller must restore the invariants before
   * returning to the user, possibly using [[recalcualteWordsInUse()]].
   * @param wordIndex The index to be accomodated.
   * @private
   */
  private expandTo(wordIndex: number) {
    const required = wordIndex + 1;
    if (this.wordsInUse < required) {
      this.ensureCapacity(required);
      this.wordsInUse = required;
    }
  }

  /**
   * Attempts to reduce internal storage used for the bits in this BitSet.
   * Calling this method may, but is not required to, affect the value returned
   * by a subsequent call to the size() property.
   * @private
   */
  private trimToSize() {
    if (this.wordsInUse !== this.bits.length) {
      this.bits = (this.bits || []).concat().slice(0, this.wordsInUse);
      this.checkInvariants();
    }
  }
}
