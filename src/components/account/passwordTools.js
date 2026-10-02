import { isStrongPassword } from '../../utils/password';

/* Look-alike characters (O/0, l/1/I) are left out so a password read aloud
   or copied from a screen survives the trip. */
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '#$%&*+-=?@!';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

const randomInt = (max) => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
};

const pick = (chars) => chars[randomInt(chars.length)];

/** A random password that always satisfies the server policy. */
export const generatePassword = (length = 14) => {
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < Math.max(length, 8)) chars.push(pick(ALL));
  // Fisher–Yates so the guaranteed characters are not always first
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const pw = chars.join('');
  return isStrongPassword(pw) ? pw : generatePassword(length);
};

/** Resolves true when the text reached the clipboard. */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
