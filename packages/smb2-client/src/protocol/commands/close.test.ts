/**
 * Unit tests for CLOSE command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { SMB2Command } from '../constants'
import { CloseFlags, createCloseRequest } from './close'

describe('CLOSE Command', () => {
  it('should create valid CLOSE request structure', () => {
    const fileId = Buffer.alloc(16, 0xdd) // 16-byte file ID
    const sessionId = 123n
    const treeId = 456

    const message = createCloseRequest(
      {
        fileId,
        flags: CloseFlags.POSTQUERY_ATTRIB,
      },
      sessionId,
      treeId,
    )

    expect(message.header.command).toBe(SMB2Command.CLOSE)
    expect(message.header.sessionId).toBe(sessionId)
    expect(message.header.treeId).toBe(treeId)

    // Verify request body structure
    const body = message.body
    let offset = 0

    // StructureSize (2 bytes): MUST be 24
    const structureSize = body.readUInt16LE(offset)
    expect(structureSize).toBe(24)
    offset += 2

    // Flags (2 bytes): Control flags
    const flags = body.readUInt16LE(offset)
    expect(flags).toBe(CloseFlags.POSTQUERY_ATTRIB)
    offset += 2

    // Reserved (4 bytes): MUST be 0
    const reserved = body.readUInt32LE(offset)
    expect(reserved).toBe(0)
    offset += 4

    // FileId (16 bytes): File ID from CREATE response
    const readFileId = body.subarray(offset, offset + 16)
    expect(readFileId.equals(fileId)).toBe(true)
  })
})
