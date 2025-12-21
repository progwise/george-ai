/**
 * SMB2 CREATE Command
 *
 * The CREATE command is used to create or open a file or directory.
 * It returns a file ID that can be used for subsequent operations like READ, QUERY_INFO, or CLOSE.
 *
 * Reference:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
import { CreateDisposition, DesiredAccess, FileAttributes, SMB2Command, ShareAccess } from '../constants'
import { SMB2Message } from '../message'
import type { CreateResponse } from '../types'

/**
 * Options for creating/opening a file or directory
 */
export interface CreateFileOptions {
  /** File or directory path relative to tree */
  path: string
  /** Desired access flags (default: GENERIC_READ) */
  desiredAccess?: number
  /** File attributes (default: NORMAL) */
  fileAttributes?: number
  /** Share access flags (default: READ) */
  shareAccess?: number
  /** Create disposition (default: OPEN) */
  createDisposition?: number
  /** Create options (default: none) */
  createOptions?: number
  /** Requested oplock level (default: NONE = 0x00) */
  requestedOplockLevel?: number
}

/**
 * Create CREATE request message
 *
 * @param options - Create options
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @returns SMB2 CREATE request message
 */
export function createCreateRequest(options: CreateFileOptions, sessionId: bigint, treeId: number): SMB2Message {
  const {
    path,
    desiredAccess = DesiredAccess.GENERIC_READ,
    fileAttributes = FileAttributes.NORMAL,
    shareAccess = ShareAccess.READ,
    createDisposition = CreateDisposition.OPEN,
    createOptions = 0,
    requestedOplockLevel = 0x00, // NONE
  } = options

  // Convert path to UTF-16LE
  const nameBuffer = Buffer.from(path, 'utf16le')

  // Calculate offsets
  const structureSize = 57 // Per spec, includes first byte of variable buffer
  const fixedSize = 56 // Actual fixed fields size
  const nameOffset = 64 + fixedSize // SMB2 header + fixed fields
  const nameLength = nameBuffer.length

  const body = Buffer.alloc(fixedSize + nameLength)
  let offset = 0

  // StructureSize (2 bytes): MUST be 57
  body.writeUInt16LE(structureSize, offset)
  offset += 2

  // SecurityFlags (1 byte)
  body.writeUInt8(0, offset)
  offset += 1

  // RequestedOplockLevel (1 byte)
  body.writeUInt8(requestedOplockLevel, offset)
  offset += 1

  // ImpersonationLevel (4 bytes): IMPERSONATION = 0x02
  body.writeUInt32LE(0x02, offset)
  offset += 4

  // SmbCreateFlags (8 bytes)
  body.writeBigUInt64LE(0n, offset)
  offset += 8

  // Reserved (8 bytes)
  body.writeBigUInt64LE(0n, offset)
  offset += 8

  // DesiredAccess (4 bytes) - apply unsigned conversion for bitwise OR results
  body.writeUInt32LE(desiredAccess >>> 0, offset)
  offset += 4

  // FileAttributes (4 bytes) - apply unsigned conversion for bitwise OR results
  body.writeUInt32LE(fileAttributes >>> 0, offset)
  offset += 4

  // ShareAccess (4 bytes) - apply unsigned conversion for bitwise OR results
  body.writeUInt32LE(shareAccess >>> 0, offset)
  offset += 4

  // CreateDisposition (4 bytes)
  body.writeUInt32LE(createDisposition, offset)
  offset += 4

  // CreateOptions (4 bytes) - apply unsigned conversion for bitwise OR results
  body.writeUInt32LE(createOptions >>> 0, offset)
  offset += 4

  // NameOffset (2 bytes)
  body.writeUInt16LE(nameOffset, offset)
  offset += 2

  // NameLength (2 bytes)
  body.writeUInt16LE(nameLength, offset)
  offset += 2

  // CreateContextsOffset (4 bytes): 0 = no create contexts
  body.writeUInt32LE(0, offset)
  offset += 4

  // CreateContextsLength (4 bytes): 0 = no create contexts
  body.writeUInt32LE(0, offset)
  offset += 4

  // Name (variable, UTF-16LE)
  nameBuffer.copy(body, offset)

  // Create message with session ID and tree ID
  return SMB2Message.createRequest(SMB2Command.CREATE, body, {
    sessionId,
    treeId,
  })
}

/**
 * Parse CREATE response message
 *
 * @param message - SMB2 CREATE response message
 * @returns Parsed CREATE response
 */
export function parseCreateResponse(message: SMB2Message): CreateResponse {
  if (!message.isResponse()) {
    throw new Error('Expected CREATE response')
  }

  if (message.header.command !== SMB2Command.CREATE) {
    throw new Error(`Expected CREATE response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`CREATE failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 89
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 89) {
    throw new Error(`Invalid CREATE response structure size: ${structureSize} (expected 89)`)
  }

  // OplockLevel (1 byte)
  const oplockLevel = body.readUInt8(offset)
  offset += 1

  // Flags (1 byte)
  const flags = body.readUInt8(offset)
  offset += 1

  // CreateAction (4 bytes)
  const createAction = body.readUInt32LE(offset)
  offset += 4

  // CreationTime (8 bytes)
  const creationTime = body.readBigUInt64LE(offset)
  offset += 8

  // LastAccessTime (8 bytes)
  const lastAccessTime = body.readBigUInt64LE(offset)
  offset += 8

  // LastWriteTime (8 bytes)
  const lastWriteTime = body.readBigUInt64LE(offset)
  offset += 8

  // ChangeTime (8 bytes)
  const changeTime = body.readBigUInt64LE(offset)
  offset += 8

  // AllocationSize (8 bytes)
  const allocationSize = body.readBigUInt64LE(offset)
  offset += 8

  // EndOfFile (8 bytes)
  const endOfFile = body.readBigUInt64LE(offset)
  offset += 8

  // FileAttributes (4 bytes)
  const fileAttributes = body.readUInt32LE(offset)
  offset += 4

  // Reserved2 (4 bytes)
  const reserved2 = body.readUInt32LE(offset)
  offset += 4

  // FileId (16 bytes) - PERSISTENT + VOLATILE
  const fileId = body.subarray(offset, offset + 16)
  offset += 16

  // CreateContextsOffset (4 bytes)
  const createContextsOffset = body.readUInt32LE(offset)
  offset += 4

  // CreateContextsLength (4 bytes)
  const createContextsLength = body.readUInt32LE(offset)
  offset += 4

  // CreateContexts (variable, optional)
  let createContexts: Buffer | undefined
  if (createContextsLength > 0 && createContextsOffset > 0) {
    const contextsStart = createContextsOffset - 64 - structureSize
    createContexts = body.subarray(contextsStart, contextsStart + createContextsLength)
  }

  return {
    structureSize,
    oplockLevel,
    flags,
    createAction,
    creationTime,
    lastAccessTime,
    lastWriteTime,
    changeTime,
    allocationSize,
    endOfFile,
    fileAttributes,
    reserved2,
    fileId,
    createContextsOffset,
    createContextsLength,
    createContexts,
  }
}

/**
 * Get create action name
 */
export function getCreateActionName(createAction: number): string {
  switch (createAction) {
    case 0x00000001:
      return 'SUPERSEDED'
    case 0x00000002:
      return 'OPENED'
    case 0x00000003:
      return 'CREATED'
    default:
      return `Unknown (0x${createAction.toString(16)})`
  }
}
