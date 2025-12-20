/**
 * Unit tests for MD4 hash implementation
 *
 * Tests verify against known MD4 test vectors
 */
import { describe, expect, it } from 'vitest'

import { md4 } from '../md4'

describe('MD4 Hash', () => {
  it('should compute correct MD4 hash for known test vectors', () => {
    // Test vector from RFC 1320
    const input = Buffer.from('', 'utf8')
    const hash = md4(input)

    // MD4("") = 31d6cfe0d16ae931b73c59d7e0c089c0
    expect(hash.toString('hex')).toBe('31d6cfe0d16ae931b73c59d7e0c089c0')
  })

  it('should compute correct MD4 hash for "a"', () => {
    // Test vector from RFC 1320
    const input = Buffer.from('a', 'utf8')
    const hash = md4(input)

    // MD4("a") = bde52cb31de33e46245e05fbdbd6fb24
    expect(hash.toString('hex')).toBe('bde52cb31de33e46245e05fbdbd6fb24')
  })

  it('should compute correct MD4 hash for "abc"', () => {
    // Test vector from RFC 1320
    const input = Buffer.from('abc', 'utf8')
    const hash = md4(input)

    // MD4("abc") = a448017aaf21d8525fc10ae87aa6729d
    expect(hash.toString('hex')).toBe('a448017aaf21d8525fc10ae87aa6729d')
  })
})
