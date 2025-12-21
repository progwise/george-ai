/**
 * SMB2 READ command
 *
 * Read data from a file.
 *
 * References:
 * - MS-SMB2 Section 2.2.19: SMB2 READ Request
 * - MS-SMB2 Section 2.2.20: SMB2 READ Response
 */
import { SMB2Command } from '../constants'
import { SMB2Message } from '../message'
import type { ReadResponse } from '../types'

export interface ReadFileOptions {
  fileId: Buffer // 16-byte file ID from CREATE response
  offset: bigint // File offset to read from
  length: number // Number of bytes to read
  minimumCount?: number // Minimum bytes to read (default: 0)
  remainingBytes?: number // Subsequent bytes client intends to read (default: 0)
}

/**
 * Create SMB2 READ request
 *
 * @param options - Read options
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @returns SMB2 READ request message
 */
export function createReadRequest(options: ReadFileOptions, sessionId: bigint, treeId: number): SMB2Message {
  const { fileId, offset, length, minimumCount = 0, remainingBytes = 0 } = options

  if (fileId.length !== 16) {
    throw new Error(`Invalid fileId length: ${fileId.length} (expected 16)`)
  }

  // Fixed structure size per SMB2 spec
  const structureSize = 49
  const fixedSize = 48 // Actual fixed fields (StructureSize includes first byte of variable buffer)
  const bufferSize = 1 // Buffer MUST be at least 1 byte per SMB2 spec

  const body = Buffer.alloc(fixedSize + bufferSize)
  let writeOffset = 0

  // StructureSize (2 bytes): MUST be 49
  body.writeUInt16LE(structureSize, writeOffset)
  writeOffset += 2

  // Padding (1 byte): For 8-byte alignment
  body.writeUInt8(0, writeOffset)
  writeOffset += 1

  // Flags (1 byte): Reserved, MUST be 0
  body.writeUInt8(0, writeOffset)
  writeOffset += 1

  // Length (4 bytes): Number of bytes to read
  body.writeUInt32LE(length, writeOffset)
  writeOffset += 4

  // Offset (8 bytes): File offset to read from
  body.writeBigUInt64LE(offset, writeOffset)
  writeOffset += 8

  // FileId (16 bytes): File ID from CREATE response
  fileId.copy(body, writeOffset)
  writeOffset += 16

  // MinimumCount (4 bytes): Minimum bytes to read
  body.writeUInt32LE(minimumCount, writeOffset)
  writeOffset += 4

  // Channel (4 bytes): Reserved, MUST be 0
  body.writeUInt32LE(0, writeOffset)
  writeOffset += 4

  // RemainingBytes (4 bytes): Subsequent bytes client intends to read
  body.writeUInt32LE(remainingBytes, writeOffset)
  writeOffset += 4

  // ReadChannelInfoOffset (2 bytes): MUST be 0 (no channel info)
  body.writeUInt16LE(0, writeOffset)
  writeOffset += 2

  // ReadChannelInfoLength (2 bytes): MUST be 0 (no channel info)
  body.writeUInt16LE(0, writeOffset)
  writeOffset += 2

  // Buffer (1 byte): MUST be at least 1 byte, SHOULD be 0
  body.writeUInt8(0, writeOffset)

  return SMB2Message.createRequest(SMB2Command.READ, body, {
    sessionId,
    treeId,
  })
}

/**
 * Parse SMB2 READ response
 *
 * @param message - SMB2 READ response message
 * @returns Parsed READ response with data
 */
export function parseReadResponse(message: SMB2Message): ReadResponse {
  if (!message.isResponse()) {
    throw new Error('Expected READ response')
  }

  if (message.header.command !== SMB2Command.READ) {
    throw new Error(`Expected READ response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`READ failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 17
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 17) {
    throw new Error(`Invalid READ response structure size: ${structureSize} (expected 17)`)
  }

  // DataOffset (1 byte): Offset from start of SMB2 header to data
  const dataOffset = body.readUInt8(offset)
  offset += 1

  // Reserved (1 byte)
  const reserved = body.readUInt8(offset)
  offset += 1

  // DataLength (4 bytes): Number of bytes read
  const dataLength = body.readUInt32LE(offset)
  offset += 4

  // DataRemaining (4 bytes): Bytes remaining to be read
  const dataRemaining = body.readUInt32LE(offset)
  offset += 4

  // Reserved2 (4 bytes)
  const reserved2 = body.readUInt32LE(offset)
  offset += 4

  // Calculate data buffer offset (relative to body start)
  // DataOffset is from start of SMB2 header (64 bytes)
  const dataBufferOffset = dataOffset - 64

  // Extract data buffer
  const buffer = body.subarray(dataBufferOffset, dataBufferOffset + dataLength)

  return {
    structureSize,
    dataOffset,
    reserved,
    dataLength,
    dataRemaining,
    reserved2,
    buffer,
  }
}
