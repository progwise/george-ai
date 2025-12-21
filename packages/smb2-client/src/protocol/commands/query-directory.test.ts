/**
 * Unit tests for QUERY_DIRECTORY command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { SMB2Command } from '../constants'
import { FileInformationClass, createQueryDirectoryRequest } from './query-directory'

describe('QUERY_DIRECTORY Command', () => {
  it('should create valid QUERY_DIRECTORY request structure', () => {
    const fileId = Buffer.alloc(16, 0xbb) // 16-byte directory file ID
    const searchPattern = '*.txt'
    const sessionId = 123n
    const treeId = 456

    const message = createQueryDirectoryRequest(
      {
        fileId,
        searchPattern,
        fileInformationClass: FileInformationClass.FileDirectoryInformation,
      },
      sessionId,
      treeId,
    )

    expect(message.header.command).toBe(SMB2Command.QUERY_DIRECTORY)
    expect(message.header.sessionId).toBe(sessionId)
    expect(message.header.treeId).toBe(treeId)

    // Verify request body structure
    const body = message.body
    let offset = 0

    // StructureSize (2 bytes): MUST be 33
    const structureSize = body.readUInt16LE(offset)
    expect(structureSize).toBe(33)
    offset += 2

    // FileInformationClass (1 byte)
    const fileInformationClass = body.readUInt8(offset)
    expect(fileInformationClass).toBe(FileInformationClass.FileDirectoryInformation)
    offset += 1

    // Flags (1 byte): Default is 0
    const flags = body.readUInt8(offset)
    expect(flags).toBe(0)
    offset += 1

    // FileIndex (4 bytes): Default is 0
    const fileIndex = body.readUInt32LE(offset)
    expect(fileIndex).toBe(0)
    offset += 4

    // FileId (16 bytes): Directory file ID from CREATE response
    const readFileId = body.subarray(offset, offset + 16)
    expect(readFileId.equals(fileId)).toBe(true)
    offset += 16

    // FileNameOffset (2 bytes): 64 (SMB2 header) + 32 (fixed fields) = 96
    const fileNameOffset = body.readUInt16LE(offset)
    expect(fileNameOffset).toBe(96)
    offset += 2

    // FileNameLength (2 bytes)
    const fileNameLength = body.readUInt16LE(offset)
    expect(fileNameLength).toBeGreaterThan(0)
    offset += 2

    // OutputBufferLength (4 bytes): Default is 65536
    const outputBufferLength = body.readUInt32LE(offset)
    expect(outputBufferLength).toBe(65536)
    offset += 4

    // Buffer (variable): File name search pattern (UTF-16LE)
    const searchPatternBuffer = body.subarray(offset, offset + fileNameLength)
    const decodedSearchPattern = searchPatternBuffer.toString('utf16le')
    expect(decodedSearchPattern).toBe(searchPattern)
  })
})
