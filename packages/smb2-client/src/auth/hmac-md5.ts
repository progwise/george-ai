/**
 * HMAC-MD5 Implementation
 *
 * HMAC-MD5 is required for NTLMv2 authentication.
 * We use Node.js crypto module's built-in HMAC support.
 */
import { createHmac } from 'node:crypto'

/**
 * Calculate HMAC-MD5
 *
 * @param key - HMAC key
 * @param data - Data to authenticate
 * @returns HMAC-MD5 digest (16 bytes)
 */
export function hmacMd5(key: Buffer, data: Buffer): Buffer {
  return createHmac('md5', key).update(data).digest()
}
