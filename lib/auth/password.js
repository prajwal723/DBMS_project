import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt with 12 rounds of salt.
 * @param {string} password - Plaintext password.
 * @returns {Promise<string>} Salted bcrypt hash.
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password with a bcrypt hash.
 * @param {string} password - Plaintext password.
 * @param {string} hash - Salted bcrypt hash from database.
 * @returns {Promise<boolean>} True if match, false otherwise.
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

