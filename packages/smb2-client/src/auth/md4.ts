/**
 * MD4 Hash Implementation (Pure JavaScript)
 *
 * MD4 is required for NTLM authentication (NT hash calculation).
 * This is a zero-dependency implementation based on RFC 1320.
 *
 * Note: MD4 is cryptographically broken and should NEVER be used
 * for new applications. We only use it because the NTLM protocol
 * requires it for backwards compatibility.
 *
 * This implementation avoids the need for Node.js --openssl-legacy-provider flag.
 */

/**
 * MD4 auxiliary functions
 */
function F(x: number, y: number, z: number): number {
  return (x & y) | (~x & z)
}

function G(x: number, y: number, z: number): number {
  return (x & y) | (x & z) | (y & z)
}

function H(x: number, y: number, z: number): number {
  return x ^ y ^ z
}

/**
 * Left rotate a 32-bit integer by n bits
 */
function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0
}

/**
 * Addition modulo 2^32
 */
function add32(...values: number[]): number {
  let sum = 0
  for (const value of values) {
    sum = (sum + value) >>> 0
  }
  return sum
}

/**
 * Calculate MD4 hash
 *
 * @param data - Data to hash
 * @returns MD4 hash (16 bytes)
 */
export function md4(data: Buffer): Buffer {
  // Initialize MD buffer (RFC 1320 Section 3.3)
  let A = 0x67452301
  let B = 0xefcdab89
  let C = 0x98badcfe
  let D = 0x10325476

  // Prepare message for processing (RFC 1320 Section 3.1 & 3.2)
  const msgLength = data.length
  const msgLengthBits = msgLength * 8

  // Padding: message + 0x80 + zeros + length (64 bits)
  const paddingLength = msgLength % 64 < 56 ? 56 - (msgLength % 64) : 120 - (msgLength % 64)
  const paddedLength = msgLength + paddingLength + 8

  const padded = Buffer.alloc(paddedLength)
  data.copy(padded, 0)
  padded[msgLength] = 0x80 // Append bit "1" (as byte 0x80)

  // Append original length in bits as 64-bit little-endian
  padded.writeUInt32LE(msgLengthBits >>> 0, paddedLength - 8)
  padded.writeUInt32LE((msgLengthBits / 0x100000000) >>> 0, paddedLength - 4)

  // Process each 512-bit (64-byte) block (RFC 1320 Section 3.4)
  for (let offset = 0; offset < paddedLength; offset += 64) {
    // Break block into sixteen 32-bit little-endian words
    const X: number[] = []
    for (let i = 0; i < 16; i++) {
      X[i] = padded.readUInt32LE(offset + i * 4)
    }

    // Save original values
    const AA = A
    const BB = B
    const CC = C
    const DD = D

    // Round 1 (RFC 1320 Section 3.4 - Step 1)
    const round1 = [
      [0, 3],
      [1, 7],
      [2, 11],
      [3, 19],
      [4, 3],
      [5, 7],
      [6, 11],
      [7, 19],
      [8, 3],
      [9, 7],
      [10, 11],
      [11, 19],
      [12, 3],
      [13, 7],
      [14, 11],
      [15, 19],
    ]

    for (const [k, s] of round1) {
      A = rotateLeft(add32(A, F(B, C, D), X[k]), s)
      // Rotate variables: A->D, B->A, C->B, D->C
      const temp = D
      D = C
      C = B
      B = A
      A = temp
    }

    // Round 2 (RFC 1320 Section 3.4 - Step 2)
    const round2 = [
      [0, 3],
      [4, 5],
      [8, 9],
      [12, 13],
      [1, 3],
      [5, 5],
      [9, 9],
      [13, 13],
      [2, 3],
      [6, 5],
      [10, 9],
      [14, 13],
      [3, 3],
      [7, 5],
      [11, 9],
      [15, 13],
    ]

    for (const [k, s] of round2) {
      A = rotateLeft(add32(A, G(B, C, D), X[k], 0x5a827999), s)
      // Rotate variables
      const temp = D
      D = C
      C = B
      B = A
      A = temp
    }

    // Round 3 (RFC 1320 Section 3.4 - Step 3)
    const round3 = [
      [0, 3],
      [8, 9],
      [4, 11],
      [12, 15],
      [2, 3],
      [10, 9],
      [6, 11],
      [14, 15],
      [1, 3],
      [9, 9],
      [5, 11],
      [13, 15],
      [3, 3],
      [11, 9],
      [7, 11],
      [15, 15],
    ]

    for (const [k, s] of round3) {
      A = rotateLeft(add32(A, H(B, C, D), X[k], 0x6ed9eba1), s)
      // Rotate variables
      const temp = D
      D = C
      C = B
      B = A
      A = temp
    }

    // Add this block's result to the running total
    A = add32(A, AA)
    B = add32(B, BB)
    C = add32(C, CC)
    D = add32(D, DD)
  }

  // Output is the concatenation of A, B, C, D (little-endian)
  const result = Buffer.alloc(16)
  result.writeUInt32LE(A, 0)
  result.writeUInt32LE(B, 4)
  result.writeUInt32LE(C, 8)
  result.writeUInt32LE(D, 12)

  return result
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
