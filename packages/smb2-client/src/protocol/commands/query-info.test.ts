/**
 * Unit tests for QUERY_INFO command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { SMB2Command } from '../constants'
import { FileInfoClass, InfoType, createQueryInfoRequest } from './query-info'

describe('QUERY_INFO Command', () => {
  it('should create valid QUERY_INFO request structure', () => {
    const fileId = Buffer.alloc(16, 0xcc) // 16-byte file ID
    const sessionId = 123n
    const treeId = 456

    const message = createQueryInfoRequest(
      {
        fileId,
        infoType: InfoType.FILE,
        fileInfoClass: FileInfoClass.FileAllInformation,
      },
      sessionId,
      treeId,
    )

    expect(message.header.command).toBe(SMB2Command.QUERY_INFO)
    expect(message.header.sessionId).toBe(sessionId)
    expect(message.header.treeId).toBe(treeId)

    // Verify request body structure
    const body = message.body
    let offset = 0

    // StructureSize (2 bytes): MUST be 41
    const structureSize = body.readUInt16LE(offset)
    expect(structureSize).toBe(41)
    offset += 2

    // InfoType (1 byte): Type of information
    const infoType = body.readUInt8(offset)
    expect(infoType).toBe(InfoType.FILE)
    offset += 1

    // FileInfoClass (1 byte): Information class
    const fileInfoClass = body.readUInt8(offset)
    expect(fileInfoClass).toBe(FileInfoClass.FileAllInformation)
    offset += 1

    // OutputBufferLength (4 bytes): Default is 65536
    const outputBufferLength = body.readUInt32LE(offset)
    expect(outputBufferLength).toBe(65536)
    offset += 4

    // InputBufferOffset (2 bytes): Should be 0 (no input buffer)
    const inputBufferOffset = body.readUInt16LE(offset)
    expect(inputBufferOffset).toBe(0)
    offset += 2

    // Reserved (2 bytes): MUST be 0
    const reserved = body.readUInt16LE(offset)
    expect(reserved).toBe(0)
    offset += 2

    // InputBufferLength (4 bytes): Should be 0 (no input buffer)
    const inputBufferLength = body.readUInt32LE(offset)
    expect(inputBufferLength).toBe(0)
    offset += 4

    // AdditionalInformation (4 bytes): Default is 0
    const additionalInformation = body.readUInt32LE(offset)
    expect(additionalInformation).toBe(0)
    offset += 4

    // Flags (4 bytes): Default is 0
    const flags = body.readUInt32LE(offset)
    expect(flags).toBe(0)
    offset += 4

    // FileId (16 bytes): File ID from CREATE response
    const readFileId = body.subarray(offset, offset + 16)
    expect(readFileId.equals(fileId)).toBe(true)
  })
})
