/**
 * Directory Operations
 *
 * High-level directory operations: list contents, get file metadata
 */
import {
  FileInformationClass,
  createQueryDirectoryRequest,
  parseQueryDirectoryResponse,
} from '../protocol/commands/query-directory'
import {
  FileInfoClass,
  InfoType,
  createQueryInfoRequest,
  parseQueryInfoResponse,
} from '../protocol/commands/query-info'
import { SMB2Connection } from '../protocol/connection'
import { FileAttributes } from '../protocol/constants'
import { SMB2ClientError } from '../utils/errors'

/**
 * File/directory metadata
 */
export interface FileMetadata {
  /** File/directory name */
  name: string
  /** Full path */
  path: string
  /** Is directory? */
  isDirectory: boolean
  /** File size in bytes */
  size: bigint
  /** Creation time */
  createdAt: Date
  /** Last modification time */
  modifiedAt: Date
  /** File attributes (from FileAttributes enum) */
  attributes: number
}

/**
 * Parse FileDirectoryInformation structure
 *
 * MS-FSCC 2.4.10: FileDirectoryInformation
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/b38bf518-9057-4c88-9ddd-5e2d3976a64b
 *
 * @param buffer - Raw buffer containing directory entries
 * @param basePath - Base directory path
 * @returns Array of file metadata
 */
function parseDirectoryInformation(buffer: Buffer, basePath: string): FileMetadata[] {
  const entries: FileMetadata[] = []
  let offset = 0

  while (offset < buffer.length) {
    // Save the start of this entry for relative offset calculation
    const entryStartOffset = offset

    // NextEntryOffset (4 bytes) - offset to next entry (relative to start of THIS entry), 0 if last
    const nextEntryOffset = buffer.readUInt32LE(offset)
    offset += 4

    // FileIndex (4 bytes) - file index (can be ignored)
    offset += 4

    // CreationTime (8 bytes) - FILETIME
    const creationTime = buffer.readBigUInt64LE(offset)
    offset += 8

    // LastAccessTime (8 bytes) - FILETIME
    offset += 8 // Skip for now

    // LastWriteTime (8 bytes) - FILETIME
    const lastWriteTime = buffer.readBigUInt64LE(offset)
    offset += 8

    // ChangeTime (8 bytes) - FILETIME
    offset += 8 // Skip for now

    // EndOfFile (8 bytes) - file size
    const endOfFile = buffer.readBigUInt64LE(offset)
    offset += 8

    // AllocationSize (8 bytes) - allocated size (skip)
    offset += 8

    // FileAttributes (4 bytes)
    const fileAttributes = buffer.readUInt32LE(offset)
    offset += 4

    // FileNameLength (4 bytes) - length of filename in bytes
    const fileNameLength = buffer.readUInt32LE(offset)
    offset += 4

    // FileName (variable length, UTF-16 LE)
    const fileName = buffer.subarray(offset, offset + fileNameLength).toString('utf16le')
    offset += fileNameLength

    // Skip . and .. entries
    if (fileName === '.' || fileName === '..') {
      if (nextEntryOffset === 0) break
      offset = entryStartOffset + nextEntryOffset
      continue
    }

    // Convert FILETIME to Date
    // FILETIME is 100-nanosecond intervals since January 1, 1601
    const windowsEpoch = new Date('1601-01-01T00:00:00Z').getTime()
    const createdAt = new Date(windowsEpoch + Number(creationTime) / 10000)
    const modifiedAt = new Date(windowsEpoch + Number(lastWriteTime) / 10000)

    // Build path
    const fullPath = basePath.endsWith('/') ? `${basePath}${fileName}` : `${basePath}/${fileName}`

    entries.push({
      name: fileName,
      path: fullPath,
      isDirectory: (fileAttributes & FileAttributes.DIRECTORY) !== 0,
      size: endOfFile,
      createdAt,
      modifiedAt,
      attributes: fileAttributes,
    })

    // Move to next entry (nextEntryOffset is relative to entryStartOffset)
    if (nextEntryOffset === 0) break
    offset = entryStartOffset + nextEntryOffset
  }

  return entries
}

/**
 * List directory contents
 *
 * Returns metadata for all files and subdirectories in the specified directory.
 * Does not recurse into subdirectories.
 *
 * @param connection - SMB2 connection
 * @param fileId - Directory file ID from CREATE response
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @param path - Directory path (for error messages and metadata)
 * @returns Array of file/directory metadata
 * @throws {SMB2ClientError} If listing fails
 *
 * @example
 * ```typescript
 * const entries = await readdir(
 *   connection,
 *   dirFileId,
 *   sessionId,
 *   treeId,
 *   '/documents'
 * )
 *
 * for (const entry of entries) {
 *   console.log(entry.name, entry.isDirectory ? '[DIR]' : entry.size.toString())
 * }
 * ```
 */
export async function readdir(
  connection: SMB2Connection,
  fileId: Buffer,
  sessionId: bigint,
  treeId: number,
  path: string,
): Promise<FileMetadata[]> {
  try {
    // Create QUERY_DIRECTORY request
    const request = createQueryDirectoryRequest(
      {
        fileId,
        searchPattern: '*',
        fileInformationClass: FileInformationClass.FileDirectoryInformation,
      },
      sessionId,
      treeId,
    )

    // Send request and check response
    const response = await connection.sendMessage(request)
    if (!response.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(response.header.status, 'readdir', path)
    }

    // Parse response
    const data = parseQueryDirectoryResponse(response)

    // Parse directory entries from buffer
    return parseDirectoryInformation(data.buffer, path)
  } catch (error) {
    if (error instanceof SMB2ClientError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new SMB2ClientError(
      `Failed to read directory: ${message}`,
      'EIO',
      undefined,
      'readdir',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * Get file/directory metadata
 *
 * Returns detailed metadata for a single file or directory.
 *
 * @param connection - SMB2 connection
 * @param fileId - File ID from CREATE response
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @param path - File/directory path (for error messages)
 * @returns File metadata
 * @throws {SMB2ClientError} If stat fails
 *
 * @example
 * ```typescript
 * const metadata = await stat(
 *   connection,
 *   fileId,
 *   sessionId,
 *   treeId,
 *   '/documents/report.pdf'
 * )
 *
 * console.log('Size:', metadata.size.toString(), 'bytes')
 * console.log('Modified:', metadata.modifiedAt)
 * ```
 */
export async function stat(
  connection: SMB2Connection,
  fileId: Buffer,
  sessionId: bigint,
  treeId: number,
  path: string,
): Promise<FileMetadata> {
  try {
    // Create QUERY_INFO request for FileAllInformation
    const request = createQueryInfoRequest(
      {
        fileId,
        infoType: InfoType.FILE,
        fileInfoClass: FileInfoClass.FileAllInformation,
      },
      sessionId,
      treeId,
    )

    // Send request and check response
    const response = await connection.sendMessage(request)
    if (!response.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(response.header.status, 'stat', path)
    }

    // Parse response
    const data = parseQueryInfoResponse(response)
    const buffer = data.buffer

    // Parse FileAllInformation structure
    // MS-FSCC 2.4.17: FileAllInformation
    // https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/95f3056a-ebc1-4f5d-b938-3f68a44677a6

    let offset = 0

    // FileBasicInformation (40 bytes)
    const creationTime = buffer.readBigUInt64LE(offset)
    offset += 8

    offset += 8 // LastAccessTime (not used in metadata)

    const lastWriteTime = buffer.readBigUInt64LE(offset)
    offset += 8

    offset += 8 // ChangeTime (not used in metadata)

    const fileAttributes = buffer.readUInt32LE(offset)
    offset += 4

    offset += 4 // Reserved

    // FileStandardInformation (24 bytes)
    offset += 8 // AllocationSize

    const endOfFile = buffer.readBigUInt64LE(offset)
    offset += 8

    // Convert FILETIME to Date
    const windowsEpoch = new Date('1601-01-01T00:00:00Z').getTime()
    const createdAt = new Date(windowsEpoch + Number(creationTime) / 10000)
    const modifiedAt = new Date(windowsEpoch + Number(lastWriteTime) / 10000)

    // Extract filename from path
    const fileName = path.split('/').filter(Boolean).pop() || path

    return {
      name: fileName,
      path,
      isDirectory: (fileAttributes & FileAttributes.DIRECTORY) !== 0,
      size: endOfFile,
      createdAt,
      modifiedAt,
      attributes: fileAttributes,
    }
  } catch (error) {
    if (error instanceof SMB2ClientError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new SMB2ClientError(
      `Failed to stat file: ${message}`,
      'EIO',
      undefined,
      'stat',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}
