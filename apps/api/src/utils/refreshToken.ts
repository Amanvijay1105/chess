import crypto from 'crypto';
import { REFRESH_TOKEN_BYTES } from '../modules/auth/constants/auth.constants.js';

export function generateTokenString() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

export function hashToken(token: string): Promise<string> {
  const salt = 'your-secret-salt';
  return new Promise((resolve, reject) => {
    crypto.scrypt(token, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}
