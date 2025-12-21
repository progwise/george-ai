/**
 * SMB2 QUERY_INFO command
 *
 * Query file, filesystem, or security information.
 *
 * References:
 * - MS-SMB2 Section 2.2.37: SMB2 QUERY_INFO Request
 * - MS-SMB2 Section 2.2.38: SMB2 QUERY_INFO Response
 */
import { SMB2Command } from '../constants'
import { SMB2Message } from '../message'
import type { QueryInfoResponse } from '../types'

/**
 * Info Type
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/9362e92f-e4bf-428a-b40c-42abeaa6ef2e
 */
export enum InfoType {
  /** File information */
  FILE = 0x01,
  /** Filesystem information */
  FILESYSTEM = 0x02,
  /** Security information */
  SECURITY = 0x03,
  /** Quota information */
  QUOTA = 0x04,
}

/**
 * File Information Class (for InfoType.FILE)
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/4718fc40-e539-4014-8e33-b675af74e3e1
 */
export enum FileInfoClass {
  /** Basic information: timestamps and attributes */
  FileBasicInformation = 0x04,
  /** Standard information: size and link count */
  FileStandardInformation = 0x05,
  /** Internal information: file index */
  FileInternalInformation = 0x06,
  /** EA (extended attributes) information */
  FileEaInformation = 0x07,
  /** Access information: access flags */
  FileAccessInformation = 0x08,
  /** Name information: file name */
  FileNameInformation = 0x09,
  /** Position information: current byte offset */
  FilePositionInformation = 0x0e,
  /** Mode information: file mode */
  FileModeInformation = 0x10,
  /** Alignment information: alignment requirement */
  FileAlignmentInformation = 0x11,
  /** All information: combination of all above */
  FileAllInformation = 0x12,
  /** Allocation information: allocation size */
  FileAllocationInformation = 0x13,
  /** End-of-file information: end of file position */
  FileEndOfFileInformation = 0x14,
  /** Alternate name information: 8.3 name */
  FileAlternateNameInformation = 0x15,
  /** Stream information: named streams */
  FileStreamInformation = 0x16,
  /** Compression information: compression format */
  FileCompressionInformation = 0x1c,
  /** Network open information: network-related info */
  FileNetworkOpenInformation = 0x22,
  /** Attribute tag information: reparse tag */
  FileAttributeTagInformation = 0x23,
}

/**
 * Filesystem Information Class (for InfoType.FILESYSTEM)
 */
export enum FilesystemInfoClass {
  /** Volume information */
  FileFsVolumeInformation = 0x01,
  /** Size information */
  FileFsSizeInformation = 0x03,
  /** Device information */
  FileFsDeviceInformation = 0x04,
  /** Attribute information */
  FileFsAttributeInformation = 0x05,
  /** Control information */
  FileFsControlInformation = 0x06,
  /** Full size information */
  FileFsFullSizeInformation = 0x07,
  /** Object ID information */
  FileFsObjectIdInformation = 0x08,
  /** Sector size information */
  FileFsSectorSizeInformation = 0x0b,
}

export interface QueryInfoOptions {
  fileId: Buffer // 16-byte file ID from CREATE response
  infoType?: InfoType // Type of information to query
  fileInfoClass?: number // Information class within the type
  outputBufferLength?: number // Maximum bytes to return
  additionalInformation?: number // Additional flags (for security info)
  flags?: number // Flags (SMB 3.1.1+)
  inputBuffer?: Buffer // Optional input buffer
}

/**
 * Create SMB2 QUERY_INFO request
 *
 * @param options - Query info options
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @returns SMB2 QUERY_INFO request message
 */
export function createQueryInfoRequest(options: QueryInfoOptions, sessionId: bigint, treeId: number): SMB2Message {
  const {
    fileId,
    infoType = InfoType.FILE,
    fileInfoClass = FileInfoClass.FileAllInformation,
    outputBufferLength = 65536, // Default: 64 KB
    additionalInformation = 0,
    flags = 0,
    inputBuffer,
  } = options

  if (fileId.length !== 16) {
    throw new Error(`Invalid fileId length: ${fileId.length} (expected 16)`)
  }

  // Fixed structure size per SMB2 spec
  const structureSize = 41
  const fixedSize = 40 // Actual fixed fields (StructureSize includes first byte of variable buffer)

  // Calculate offsets
  const inputBufferOffset = inputBuffer && inputBuffer.length > 0 ? 64 + fixedSize : 0
  const inputBufferLength = inputBuffer?.length ?? 0

  const body = Buffer.alloc(fixedSize + inputBufferLength)
  let writeOffset = 0

  // StructureSize (2 bytes): MUST be 41
  body.writeUInt16LE(structureSize, writeOffset)
  writeOffset += 2

  // InfoType (1 byte): Type of information
  body.writeUInt8(infoType, writeOffset)
  writeOffset += 1

  // FileInfoClass (1 byte): Information class within the type
  body.writeUInt8(fileInfoClass, writeOffset)
  writeOffset += 1

  // OutputBufferLength (4 bytes): Maximum bytes to return
  body.writeUInt32LE(outputBufferLength, writeOffset)
  writeOffset += 4

  // InputBufferOffset (2 bytes): Offset to input buffer (or 0)
  body.writeUInt16LE(inputBufferOffset, writeOffset)
  writeOffset += 2

  // Reserved (2 bytes): MUST be 0
  body.writeUInt16LE(0, writeOffset)
  writeOffset += 2

  // InputBufferLength (4 bytes): Length of input buffer (or 0)
  body.writeUInt32LE(inputBufferLength, writeOffset)
  writeOffset += 4

  // AdditionalInformation (4 bytes): Additional flags
  body.writeUInt32LE(additionalInformation, writeOffset)
  writeOffset += 4

  // Flags (4 bytes): Flags (SMB 3.1.1+)
  body.writeUInt32LE(flags, writeOffset)
  writeOffset += 4

  // FileId (16 bytes): File ID from CREATE response
  fileId.copy(body, writeOffset)
  writeOffset += 16

  // Buffer (variable): Input buffer (optional)
  if (inputBuffer && inputBuffer.length > 0) {
    inputBuffer.copy(body, writeOffset)
  }

  return SMB2Message.createRequest(SMB2Command.QUERY_INFO, body, {
    sessionId,
    treeId,
  })
}

/**
 * Parse SMB2 QUERY_INFO response
 *
 * @param message - SMB2 QUERY_INFO response message
 * @returns Parsed QUERY_INFO response with output buffer
 */
export function parseQueryInfoResponse(message: SMB2Message): QueryInfoResponse {
  if (!message.isResponse()) {
    throw new Error('Expected QUERY_INFO response')
  }

  if (message.header.command !== SMB2Command.QUERY_INFO) {
    throw new Error(`Expected QUERY_INFO response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`QUERY_INFO failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 9
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 9) {
    throw new Error(`Invalid QUERY_INFO response structure size: ${structureSize} (expected 9)`)
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
