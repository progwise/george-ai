/**
 * Unit tests for NTLM v2 authentication implementation
 *
 * Tests verify message structure against NTLM specification
 */
import { describe, expect, it } from 'vitest'

import { createType1Message } from './ntlm'
import { NTLMMessageType } from './types'

describe('NTLM Authentication', () => {
  it('should create valid NTLM Type 1 message structure', () => {
    const message = createType1Message()

    // Verify NTLM signature (8 bytes): "NTLMSSP\0"
    expect(message.subarray(0, 8).toString('binary')).toBe('NTLMSSP\0')

    // Verify message type (4 bytes at offset 8): 1 = NEGOTIATE
    const messageType = message.readUInt32LE(8)
    expect(messageType).toBe(NTLMMessageType.NEGOTIATE)

    // Verify message length is 32 bytes (fixed for Type 1)
    expect(message.length).toBe(32)

    // Verify flags are set (non-zero)
    const flags = message.readUInt32LE(12)
    expect(flags).toBeGreaterThan(0)
  })
})
