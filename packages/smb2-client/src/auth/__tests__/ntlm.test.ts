/**
 * Unit tests for NTLM v2 authentication implementation
 *
 * Tests verify message structure against NTLM specification
 */
import { describe, expect, it } from 'vitest'

import { createType1Message, parseType2Message } from '../ntlm'
import { NTLMMessageType } from '../types'

describe('NTLM Authentication', () => {
  describe('createType1Message', () => {
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

  describe('parseType2Message', () => {
    it('should parse valid NTLM Type 2 message structure', () => {
      // Create a minimal Type 2 (CHALLENGE) message
      const buffer = Buffer.alloc(56)
      let offset = 0

      // Signature: "NTLMSSP\0"
      Buffer.from('NTLMSSP\0', 'binary').copy(buffer, offset)
      offset += 8

      // Message type: 2 = CHALLENGE
      buffer.writeUInt32LE(NTLMMessageType.CHALLENGE, offset)
      offset += 4

      // Target name fields (empty for this test)
      buffer.writeUInt16LE(0, offset) // Length
      buffer.writeUInt16LE(0, offset + 2) // MaxLength
      buffer.writeUInt32LE(0, offset + 4) // Offset
      offset += 8

      // Flags
      buffer.writeUInt32LE(0x00000001, offset)
      offset += 4

      // Server challenge (8 bytes)
      const expectedChallenge = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])
      expectedChallenge.copy(buffer, offset)
      offset += 8

      // Reserved (8 bytes)
      offset += 8

      // Target info fields (empty for this test)
      buffer.writeUInt16LE(0, offset) // Length
      buffer.writeUInt16LE(0, offset + 2) // MaxLength
      buffer.writeUInt32LE(0, offset + 4) // Offset

      const result = parseType2Message(buffer)

      expect(result.challenge).toEqual(expectedChallenge)
      expect(result.flags).toBe(0x00000001)
    })

    it('should reject invalid NTLM signature', () => {
      const buffer = Buffer.alloc(56)
      Buffer.from('INVALID\0', 'binary').copy(buffer)

      expect(() => parseType2Message(buffer)).toThrow('Invalid NTLM signature')
    })

    it('should reject wrong message type', () => {
      const buffer = Buffer.alloc(56)
      Buffer.from('NTLMSSP\0', 'binary').copy(buffer)
      buffer.writeUInt32LE(NTLMMessageType.NEGOTIATE, 8) // Wrong type (should be CHALLENGE)

      expect(() => parseType2Message(buffer)).toThrow('Expected CHALLENGE message')
    })
  })
})
