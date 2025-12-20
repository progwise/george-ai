/**
 * MD4 Hash Implementation
 *
 * MD4 is required for NTLM authentication (NT hash calculation).
 * Node.js crypto module supports MD4, so we use it directly.
 *
 * Note: MD4 is cryptographically broken and should NEVER be used
 * for new applications. We only use it because the NTLM protocol
 * requires it for backwards compatibility.
 */
import { createHash } from 'node:crypto'

/**
 * Calculate MD4 hash
 *
 * @param data - Data to hash
 * @returns MD4 hash (16 bytes)
 */
export function md4(data: Buffer): Buffer {
  return createHash('md4').update(data).digest()
}

/**
 * Calculate NT hash (MD4 of UTF-16LE password)
 *
 * The NT hash is used in NTLM authentication and is calculated as:
 * NT_HASH = MD4(UTF16-LE(password))
 *
 * @param password - User password
 * @returns NT hash (16 bytes)
 */
export function ntHash(password: string): Buffer {
  // Convert password to UTF-16 Little Endian
  const passwordUtf16 = Buffer.from(password, 'utf16le')

  // Calculate MD4 hash
  return md4(passwordUtf16)
}
