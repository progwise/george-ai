/**
 * Unit tests for SMB2 message serialization/deserialization
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { NTStatus, SMB2Command } from '../constants'
import { SMB2Message } from '../message'

describe('SMB2Message', () => {
  describe('Message Structure', () => {
    it('should serialize message with correct NetBIOS header', () => {
      const body = Buffer.from('test')
      const message = SMB2Message.createRequest(SMB2Command.NEGOTIATE, body)
      const buffer = message.toBuffer()

      // NetBIOS header: first byte must be 0x00
      expect(buffer.readUInt8(0)).toBe(0x00)

      // NetBIOS length (24-bit big-endian at offset 1)
      const messageLength = buffer.readUIntBE(1, 3)
      expect(messageLength).toBe(64 + body.length) // SMB2 header (64) + body
    })

    it('should serialize message with correct SMB2 protocol ID', () => {
      const message = SMB2Message.createRequest(SMB2Command.NEGOTIATE, Buffer.alloc(0))
      const buffer = message.toBuffer()

      // SMB2 protocol ID at offset 4 (after NetBIOS header)
      const protocolId = buffer.subarray(4, 8)
      expect(protocolId).toEqual(Buffer.from([0xfe, 0x53, 0x4d, 0x42])) // \xFESMB
    })

    it('should deserialize message correctly (round-trip)', () => {
      const originalBody = Buffer.from('test data')
      const original = SMB2Message.createRequest(SMB2Command.SESSION_SETUP, originalBody, {
        sessionId: 42n,
        treeId: 123,
      })

      const buffer = original.toBuffer()
      const deserialized = SMB2Message.fromBuffer(buffer)

      expect(deserialized.header.command).toBe(SMB2Command.SESSION_SETUP)
      expect(deserialized.header.sessionId).toBe(42n)
      expect(deserialized.header.treeId).toBe(123)
      expect(deserialized.body).toEqual(originalBody)
    })

    it('should reject invalid SMB2 protocol ID', () => {
      const buffer = Buffer.alloc(100)
      buffer.writeUInt8(0x00, 0) // NetBIOS header
      buffer.writeUIntBE(64, 1, 3) // Length
      // Write invalid protocol ID (not \xFESMB)
      Buffer.from([0xff, 0xff, 0xff, 0xff]).copy(buffer, 4)

      expect(() => SMB2Message.fromBuffer(buffer)).toThrow('Invalid SMB2 protocol ID')
    })
  })

  describe('Status Helpers', () => {
    it('should correctly identify SUCCESS status', () => {
      const message = SMB2Message.createRequest(SMB2Command.NEGOTIATE, Buffer.alloc(0))
      message.header.status = NTStatus.SUCCESS

      expect(message.isSuccess()).toBe(true)
      expect(message.isMoreProcessingRequired()).toBe(false)
    })

    it('should correctly identify MORE_PROCESSING_REQUIRED status', () => {
      const message = SMB2Message.createRequest(SMB2Command.SESSION_SETUP, Buffer.alloc(0))
      message.header.status = NTStatus.MORE_PROCESSING_REQUIRED

      expect(message.isSuccess()).toBe(false)
      expect(message.isMoreProcessingRequired()).toBe(true)
    })

    it('should format status string with name and hex', () => {
      const message = SMB2Message.createRequest(SMB2Command.NEGOTIATE, Buffer.alloc(0))
      message.header.status = NTStatus.SUCCESS

      const statusString = message.getStatusString()
      expect(statusString).toBe('SUCCESS (0x00000000)')
    })
  })

  describe('Response Detection', () => {
    it('should detect request vs response based on flags', () => {
      const request = SMB2Message.createRequest(SMB2Command.NEGOTIATE, Buffer.alloc(0))
      expect(request.isResponse()).toBe(false)

      const response = SMB2Message.createRequest(SMB2Command.NEGOTIATE, Buffer.alloc(0))
      response.header.flags = 0x00000001 // SERVER_TO_REDIR flag
      expect(response.isResponse()).toBe(true)
    })
  })
})
