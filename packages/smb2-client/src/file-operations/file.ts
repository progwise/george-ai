/**
 * File Operations
 *
 * High-level file operations: read files, streaming
 */
import { createReadRequest, parseReadResponse } from '../protocol/commands/read'
import { SMB2Connection } from '../protocol/connection'
import { NTStatus } from '../protocol/constants'
import { SMB2ClientError } from '../utils/errors'

/**
 * Options for file read operations
 */
export interface ReadFileOptions {
  /** Starting offset in bytes (default: 0) */
  offset?: bigint
  /** Maximum bytes to read (default: read entire file) */
  length?: number
  /** Chunk size for reads (default: 64KB) */
  chunkSize?: number
}

/**
 * Read entire file into Buffer
 *
 * Reads file in chunks and concatenates into a single Buffer.
 * Use createReadStream() for large files to avoid loading entire file into memory.
 *
 * @param connection - SMB2 connection
 * @param fileId - File ID from CREATE response
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @param path - File path (for error messages)
 * @param options - Read options
 * @returns File contents as Buffer
 * @throws {SMB2ClientError} If read fails
 *
 * @example
 * ```typescript
 * const fileContent = await readFile(
 *   connection,
 *   fileId,
 *   sessionId,
 *   treeId,
 *   '/documents/report.txt'
 * )
 * console.log(fileContent.toString('utf8'))
 * ```
 */
export async function readFile(
  connection: SMB2Connection,
  fileId: Buffer,
  sessionId: bigint,
  treeId: number,
  path: string,
  options: ReadFileOptions = {},
): Promise<Buffer> {
  const { offset = 0n, length, chunkSize = 65536 } = options
  const chunks: Buffer[] = []
  let currentOffset = offset
  let totalRead = 0

  try {
    while (true) {
      // Calculate read length (respect both chunkSize and optional total length limit)
      const readLength = length ? Math.min(chunkSize, length - totalRead) : chunkSize

      if (readLength <= 0) break

      // Create READ request
      const readRequest = createReadRequest(
        {
          fileId,
          offset: currentOffset,
          length: readLength,
        },
        sessionId,
        treeId,
      )

      // Send request and check response
      const response = await connection.sendMessage(readRequest)
      if (!response.isSuccess()) {
        // STATUS_END_OF_FILE is normal when reading at/beyond EOF
        if (response.header.status === NTStatus.END_OF_FILE) break
        throw SMB2ClientError.fromSMBStatus(response.header.status, 'readFile', path)
      }

      // Parse response
      const data = parseReadResponse(response)
      if (data.dataLength === 0) break // EOF reached

      // Collect chunk
      chunks.push(data.buffer)
      totalRead += data.dataLength
      currentOffset += BigInt(data.dataLength)

      // Stop if we've read requested length
      if (length && totalRead >= length) break
    }

    return Buffer.concat(chunks)
  } catch (error) {
    if (error instanceof SMB2ClientError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new SMB2ClientError(
      `Failed to read file: ${message}`,
      'EIO',
      undefined,
      'readFile',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}

/**
 * Create async generator for streaming file reads
 *
 * Returns an async generator that yields file chunks as they're read.
 * More efficient than readFile() for large files as it doesn't load entire file into memory.
 *
 * @param connection - SMB2 connection
 * @param fileId - File ID from CREATE response
 * @param sessionId - Session ID from SESSION_SETUP
 * @param treeId - Tree ID from TREE_CONNECT
 * @param path - File path (for error messages)
 * @param options - Read options
 * @yields File chunks as Buffers
 * @throws {SMB2ClientError} If read fails
 *
 * @example
 * ```typescript
 * // Manual iteration
 * const stream = createReadStream(connection, fileId, sessionId, treeId, '/large-file.zip')
 * for await (const chunk of stream) {
 *   console.log('Received chunk:', chunk.length, 'bytes')
 *   // Process chunk
 * }
 *
 * // Convert to Node.js Readable stream
 * import { Readable } from 'stream'
 * const nodeStream = Readable.from(createReadStream(...))
 * nodeStream.pipe(outputStream)
 * ```
 */
export async function* createReadStream(
  connection: SMB2Connection,
  fileId: Buffer,
  sessionId: bigint,
  treeId: number,
  path: string,
  options: ReadFileOptions = {},
): AsyncGenerator<Buffer, void, undefined> {
  const { offset = 0n, length, chunkSize = 65536 } = options
  let currentOffset = offset
  let totalRead = 0

  try {
    while (true) {
      // Calculate read length
      const readLength = length ? Math.min(chunkSize, length - totalRead) : chunkSize

      if (readLength <= 0) break

      // Create READ request
      const readRequest = createReadRequest(
        {
          fileId,
          offset: currentOffset,
          length: readLength,
        },
        sessionId,
        treeId,
      )

      // Send request and check response
      const response = await connection.sendMessage(readRequest)
      if (!response.isSuccess()) {
        // STATUS_END_OF_FILE is normal when reading at/beyond EOF
        if (response.header.status === NTStatus.END_OF_FILE) break
        throw SMB2ClientError.fromSMBStatus(response.header.status, 'createReadStream', path)
      }

      // Parse response
      const data = parseReadResponse(response)
      if (data.dataLength === 0) break // EOF reached

      // Yield chunk to consumer
      yield data.buffer
      totalRead += data.dataLength
      currentOffset += BigInt(data.dataLength)

      // Stop if we've read requested length
      if (length && totalRead >= length) break
    }
  } catch (error) {
    if (error instanceof SMB2ClientError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new SMB2ClientError(
      `Stream read failed: ${message}`,
      'EIO',
      undefined,
      'createReadStream',
      path,
      error instanceof Error ? error : undefined,
    )
  }
}
