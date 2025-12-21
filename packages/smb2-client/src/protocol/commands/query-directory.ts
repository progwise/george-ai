/**
 * SMB2 QUERY_DIRECTORY command
 *
 * Query (enumerate) a directory for file entries.
 *
 * References:
 * - MS-SMB2 Section 2.2.33: SMB2 QUERY_DIRECTORY Request
 * - MS-SMB2 Section 2.2.34: SMB2 QUERY_DIRECTORY Response
 */
import { SMB2Command } from '../constants'
import { SMB2Message } from '../message'
import type { QueryDirectoryResponse } from '../types'

/**
 * File Information Class
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/4718fc40-e539-4014-8e33-b675af74e3e1
 */
export enum FileInformationClass {
  /** File directory information */
  FileDirectoryInformation = 0x01,
  /** Full directory information */
  FileFullDirectoryInformation = 0x02,
  /** Both directory information (8.3 names + long names) */
  FileBothDirectoryInformation = 0x03,
  /** File names only */
  FileNamesInformation = 0x0c,
  /** ID both directory information */
  FileIdBothDirectoryInformation = 0x25,
  /** ID full directory information */
  FileIdFullDirectoryInformation = 0x26,
}

/**
 * Query Directory Flags
 */
export enum QueryDirectoryFlags {
  /** Restart the scan from the beginning */
  RESTART_SCANS = 0x01,
  /** Return a single entry */
  RETURN_SINGLE_ENTRY = 0x02,
  /** Search pattern must be matched exactly (not wildcards) */
  INDEX_SPECIFIED = 0x04,
  /** Continue search from where it left off */
  REOPEN = 0x10,
}

export interface QueryDirectoryOptions {
  fileId: Buffer // 16-byte file ID of directory from CREATE response
  searchPattern?: string // File name search pattern (e.g., "*", "*.txt")
  fileInformationClass?: FileInformationClass // Information class to return
  flags?: number // Query flags (restart, single entry, etc.)
  fileIndex?: number // File index to start from
  outputBufferLength?: number // Maximum bytes to return
}

/**
 * Create SMB2 QUERY_DIRECTORY request
 *
 * @param options - Query directory options
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @returns SMB2 QUERY_DIRECTORY request message
 */
export function createQueryDirectoryRequest(
  options: QueryDirectoryOptions,
  sessionId: bigint,
  treeId: number,
): SMB2Message {
  const {
    fileId,
    searchPattern = '*', // Default: all files
    fileInformationClass = FileInformationClass.FileDirectoryInformation,
    flags = 0,
    fileIndex = 0,
    outputBufferLength = 65536, // Default: 64 KB
  } = options

  if (fileId.length !== 16) {
    throw new Error(`Invalid fileId length: ${fileId.length} (expected 16)`)
  }

  // Convert search pattern to UTF-16LE
  const searchPatternBuffer = Buffer.from(searchPattern, 'utf16le')

  // Fixed structure size per SMB2 spec
  const structureSize = 33
  const fixedSize = 32 // Actual fixed fields (StructureSize includes first byte of variable buffer)

  // Calculate offsets
  const fileNameOffset = searchPatternBuffer.length > 0 ? 64 + fixedSize : 0 // SMB2 header + fixed fields
  const fileNameLength = searchPatternBuffer.length

  const body = Buffer.alloc(fixedSize + fileNameLength)
  let writeOffset = 0

  // StructureSize (2 bytes): MUST be 33
  body.writeUInt16LE(structureSize, writeOffset)
  writeOffset += 2

  // FileInformationClass (1 byte): Information class to return
  body.writeUInt8(fileInformationClass, writeOffset)
  writeOffset += 1

  // Flags (1 byte): Control flags
  body.writeUInt8(flags, writeOffset)
  writeOffset += 1

  // FileIndex (4 bytes): File index to start from
  body.writeUInt32LE(fileIndex, writeOffset)
  writeOffset += 4

  // FileId (16 bytes): File ID of directory from CREATE response
  fileId.copy(body, writeOffset)
  writeOffset += 16

  // FileNameOffset (2 bytes): Offset to file name search pattern
  body.writeUInt16LE(fileNameOffset, writeOffset)
  writeOffset += 2

  // FileNameLength (2 bytes): Length of file name search pattern
  body.writeUInt16LE(fileNameLength, writeOffset)
  writeOffset += 2

  // OutputBufferLength (4 bytes): Maximum bytes to return
  body.writeUInt32LE(outputBufferLength, writeOffset)
  writeOffset += 4

  // Buffer (variable): File name search pattern (UTF-16LE)
  if (searchPatternBuffer.length > 0) {
    searchPatternBuffer.copy(body, writeOffset)
  }

  return SMB2Message.createRequest(SMB2Command.QUERY_DIRECTORY, body, {
    sessionId,
    treeId,
  })
}

/**
 * Parse SMB2 QUERY_DIRECTORY response
 *
 * @param message - SMB2 QUERY_DIRECTORY response message
 * @returns Parsed QUERY_DIRECTORY response with output buffer
 */
export function parseQueryDirectoryResponse(message: SMB2Message): QueryDirectoryResponse {
  if (!message.isResponse()) {
    throw new Error('Expected QUERY_DIRECTORY response')
  }

  if (message.header.command !== SMB2Command.QUERY_DIRECTORY) {
    throw new Error(`Expected QUERY_DIRECTORY response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`QUERY_DIRECTORY failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 9
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 9) {
    throw new Error(`Invalid QUERY_DIRECTORY response structure size: ${structureSize} (expected 9)`)
  }

  // OutputBufferOffset (2 bytes): Offset from start of SMB2 header to output buffer
  const outputBufferOffset = body.readUInt16LE(offset)
  offset += 2

  // OutputBufferLength (4 bytes): Length of output buffer
  const outputBufferLength = body.readUInt32LE(offset)
  offset += 4

  // Calculate output buffer offset (relative to body start)
  // OutputBufferOffset is from start of SMB2 header (64 bytes)
  const bufferOffset = outputBufferOffset - 64

  // Extract output buffer
  const buffer = body.subarray(bufferOffset, bufferOffset + outputBufferLength)

  return {
    structureSize,
    outputBufferOffset,
    outputBufferLength,
    buffer,
  }
}
