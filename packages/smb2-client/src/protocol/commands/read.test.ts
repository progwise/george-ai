/**
 * Unit tests for READ command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { SMB2Command } from '../constants'
import { createReadRequest } from './read'

describe('READ Command', () => {
  it('should create valid READ request structure', () => {
    const fileId = Buffer.alloc(16, 0xaa) // 16-byte file ID
    const offset = 1024n
    const length = 4096
    const sessionId = 123n
    const treeId = 456

    const message = createReadRequest(
      {
        fileId,
        offset,
        length,
      },
      sessionId,
      treeId,
    )

    expect(message.header.command).toBe(SMB2Command.READ)
    expect(message.header.sessionId).toBe(sessionId)
    expect(message.header.treeId).toBe(treeId)

    // Verify request body structure
    const body = message.body
    let readOffset = 0

    // StructureSize (2 bytes): MUST be 49
    const structureSize = body.readUInt16LE(readOffset)
    expect(structureSize).toBe(49)
    readOffset += 2

    // Padding (1 byte): For 8-byte alignment
    const padding = body.readUInt8(readOffset)
    expect(padding).toBe(0)
    readOffset += 1

    // Flags (1 byte): Reserved, MUST be 0
    const flags = body.readUInt8(readOffset)
    expect(flags).toBe(0)
    readOffset += 1

    // Length (4 bytes): Number of bytes to read
    const readLength = body.readUInt32LE(readOffset)
    expect(readLength).toBe(length)
    readOffset += 4

    // Offset (8 bytes): File offset to read from
    const readFileOffset = body.readBigUInt64LE(readOffset)
    expect(readFileOffset).toBe(offset)
    readOffset += 8

    // FileId (16 bytes): File ID from CREATE response
    const readFileId = body.subarray(readOffset, readOffset + 16)
    expect(readFileId.equals(fileId)).toBe(true)
    readOffset += 16

    // MinimumCount (4 bytes): Minimum bytes to read (default: 0)
    const minimumCount = body.readUInt32LE(readOffset)
    expect(minimumCount).toBe(0)
    readOffset += 4

    // Channel (4 bytes): Reserved, MUST be 0
    const channel = body.readUInt32LE(readOffset)
    expect(channel).toBe(0)
    readOffset += 4

    // RemainingBytes (4 bytes): Subsequent bytes client intends to read (default: 0)
    const remainingBytes = body.readUInt32LE(readOffset)
    expect(remainingBytes).toBe(0)
    readOffset += 4

    // ReadChannelInfoOffset (2 bytes): MUST be 0 (no channel info)
    const readChannelInfoOffset = body.readUInt16LE(readOffset)
    expect(readChannelInfoOffset).toBe(0)
    readOffset += 2

    // ReadChannelInfoLength (2 bytes): MUST be 0 (no channel info)
    const readChannelInfoLength = body.readUInt16LE(readOffset)
    expect(readChannelInfoLength).toBe(0)
  })
})
