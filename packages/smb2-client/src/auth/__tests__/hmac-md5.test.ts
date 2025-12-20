/**
 * Unit tests for HMAC-MD5 implementation
 *
 * Tests verify against known HMAC-MD5 test vectors from RFC 2104
 */
import { describe, expect, it } from 'vitest'

import { hmacMd5 } from '../hmac-md5'

describe('HMAC-MD5', () => {
  it('should compute correct HMAC-MD5 for RFC 2104 test case 1', () => {
    // Test case 1: key = 0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b, data = "Hi There"
    const key = Buffer.alloc(16, 0x0b)
    const data = Buffer.from('Hi There', 'utf8')
    const hash = hmacMd5(key, data)

    // Expected: 0x9294727a3638bb1c13f48ef8158bfc9d
    expect(hash.toString('hex')).toBe('9294727a3638bb1c13f48ef8158bfc9d')
  })

  it('should compute correct HMAC-MD5 for RFC 2104 test case 2', () => {
    // Test case 2: key = "Jefe", data = "what do ya want for nothing?"
    const key = Buffer.from('Jefe', 'utf8')
    const data = Buffer.from('what do ya want for nothing?', 'utf8')
    const hash = hmacMd5(key, data)

    // Expected: 0x750c783e6ab0b503eaa86e310a5db738
    expect(hash.toString('hex')).toBe('750c783e6ab0b503eaa86e310a5db738')
  })

  it('should compute correct HMAC-MD5 for RFC 2104 test case 3', () => {
    // Test case 3: key = 0xaa repeated 16 times, data = 0xdd repeated 50 times
    const key = Buffer.alloc(16, 0xaa)
    const data = Buffer.alloc(50, 0xdd)
    const hash = hmacMd5(key, data)

    // Expected: 0x56be34521d144c88dbb8c733f0e8b3f6
    expect(hash.toString('hex')).toBe('56be34521d144c88dbb8c733f0e8b3f6')
  })
})
