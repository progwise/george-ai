/**
 * SMB2 CLOSE command
 *
 * Close a file, directory, or other object.
 *
 * References:
 * - MS-SMB2 Section 2.2.15: SMB2 CLOSE Request
 * - MS-SMB2 Section 2.2.16: SMB2 CLOSE Response
 */
import { SMB2Command } from '../constants'
import { SMB2Message } from '../message'
import type { CloseResponse } from '../types'

/**
 * CLOSE Flags
 */
export enum CloseFlags {
  /** No flags */
  NONE = 0x0000,
  /** Return file attributes in response */
  POSTQUERY_ATTRIB = 0x0001,
}

export interface CloseFileOptions {
  fileId: Buffer // 16-byte file ID from CREATE response
  flags?: CloseFlags // Control flags
}

/**
 * Create SMB2 CLOSE request
 *
 * @param options - Close options
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @returns SMB2 CLOSE request message
 */
export function createCloseRequest(options: CloseFileOptions, sessionId: bigint, treeId: number): SMB2Message {
  const { fileId, flags = CloseFlags.NONE } = options

  if (fileId.length !== 16) {
    throw new Error(`Invalid fileId length: ${fileId.length} (expected 16)`)
  }

  // Fixed structure size per SMB2 spec
  const structureSize = 24

  const body = Buffer.alloc(structureSize)
  let writeOffset = 0

  // StructureSize (2 bytes): MUST be 24
  body.writeUInt16LE(structureSize, writeOffset)
  writeOffset += 2

  // Flags (2 bytes): Control flags
  body.writeUInt16LE(flags, writeOffset)
  writeOffset += 2

  // Reserved (4 bytes): MUST be 0
  body.writeUInt32LE(0, writeOffset)
  writeOffset += 4

  // FileId (16 bytes): File ID from CREATE response
  fileId.copy(body, writeOffset)

  return SMB2Message.createRequest(SMB2Command.CLOSE, body, {
    sessionId,
    treeId,
  })
}

/**
 * Parse SMB2 CLOSE response
 *
 * @param message - SMB2 CLOSE response message
 * @returns Parsed CLOSE response with file attributes
 */
export function parseCloseResponse(message: SMB2Message): CloseResponse {
  if (!message.isResponse()) {
    throw new Error('Expected CLOSE response')
  }

  if (message.header.command !== SMB2Command.CLOSE) {
    throw new Error(`Expected CLOSE response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`CLOSE failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 60
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 60) {
    throw new Error(`Invalid CLOSE response structure size: ${structureSize} (expected 60)`)
  }

  // Flags (2 bytes): Response flags
  const flags = body.readUInt16LE(offset)
  offset += 2

  // Reserved (4 bytes)
  const reserved = body.readUInt32LE(offset)
  offset += 4

  // CreationTime (8 bytes): File creation time
  const creationTime = body.readBigUInt64LE(offset)
  offset += 8

  // LastAccessTime (8 bytes): Last access time
  const lastAccessTime = body.readBigUInt64LE(offset)
  offset += 8

  // LastWriteTime (8 bytes): Last write time
  const lastWriteTime = body.readBigUInt64LE(offset)
  offset += 8

  // ChangeTime (8 bytes): Change time
  const changeTime = body.readBigUInt64LE(offset)
  offset += 8

  // AllocationSize (8 bytes): Allocated size
  const allocationSize = body.readBigUInt64LE(offset)
  offset += 8

  // EndOfFile (8 bytes): File size
  const endOfFile = body.readBigUInt64LE(offset)
  offset += 8

  // FileAttributes (4 bytes): File attributes
  const fileAttributes = body.readUInt32LE(offset)

  return {
    structureSize,
    flags,
    reserved,
    creationTime,
    lastAccessTime,
    lastWriteTime,
    changeTime,
    allocationSize,
    endOfFile,
    fileAttributes,
  }
}
