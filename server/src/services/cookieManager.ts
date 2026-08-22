import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from '../config.js';

function loadKey(): Buffer {
  const raw = config.encryptKey;
  if (!raw) throw new Error('CONFIG_MISSING: YOUTUBE_COOKIES_ENCRYPT_KEY');
  // hex(64) | base64(44-char) | utf8 32 chars
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  const b64 = Buffer.from(raw, 'base64');
  if (b64.length === 32) return b64;
  const utf8 = Buffer.from(raw, 'utf8');
  if (utf8.length === 32) return utf8;
  throw new Error('CONFIG_INVALID: key must be 32 bytes in hex/base64/utf8');
}

export function encryptCookies(cookies: Record<string, string>): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', loadKey(), iv);
  const plain = Buffer.from(JSON.stringify(cookies), 'utf8');
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${enc.toString('base64')}:${tag.toString('base64')}`;
}

export function decryptCookies(payload: string): Record<string, string> {
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('COOKIES_CORRUPT');
  const [ivB64, dataB64, tagB64] = parts;
  if (!ivB64 || !dataB64 || !tagB64) throw new Error('COOKIES_CORRUPT');
  const decipher = createDecipheriv('aes-256-gcm', loadKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return JSON.parse(dec.toString('utf8')) as Record<string, string>;
}