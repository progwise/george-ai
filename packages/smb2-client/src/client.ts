/**
 * SMB2 Client
 *
 * High-level SMB2 client with intuitive Node.js-like API
 */
import { Readable } from 'stream'

import { type FileMetadata, readdir, stat } from './file-operations/directory'
import { type ReadFileOptions, createReadStream as createFileReadStream, readFile } from './file-operations/file'
import { createCloseRequest } from './protocol/commands/close'
import { createCreateRequest, parseCreateResponse } from './protocol/commands/create'
import { SMB2Connection } from './protocol/connection'
import { CreateDisposition, CreateOptions, DesiredAccess, FileAttributes, ShareAccess } from './protocol/constants'
import { SessionManager } from './session/session-manager'
import { TreeManager } from './session/tree-manager'
import { SMB2ClientError } from './utils/errors'

/**
 * SMB2 Client configuration options
 */
export interface SMB2ClientOptions {
  /** SMB server hostname or IP */
  host: string
  /** SMB server port (default: 445) */
  port?: number
  /** Windows domain (default: 'WORKGROUP') */
  domain?: string
  /** Username for authentication */
  username: string
  /** Password for authentication */
  password: string
  /** Share name (e.g., 'documents', 'public') */
  share: string
  /** Workstation name (default: 'NODE-SMB2-CLIENT') */
  workstation?: string
  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number
  /** Auto-connect on first operation (default: true) */
  autoConnect?: boolean
}

/**
 * High-level SMB2 client
 *
 * Provides Node.js-friendly API for SMB2 file operations with automatic connection management.
 *
 * @example
 * ```typescript
 * const client = new SMB2Client({
 *   host: 'fileserver.local',
 *   share: 'documents',
 *   username: 'user',
 *   password: 'password',
 * })
 *
 * try {
 *   // Auto-connects on first operation
 *   const files = await client.readdir('/')
 *   console.log('Files:', files.map(f => f.name))
 *
 *   const content = await client.readFile('/report.txt')
 *   console.log('Content:', content.toString('utf8'))
 * } finally {
 *   await client.disconnect()
 * }
 * ```
 */
export class SMB2Client {
  private connection?: SMB2Connection
  private sessionManager?: SessionManager
  private treeManager?: TreeManager
  private sessionId?: bigint
  private treeId?: number
  private connected = false
  private connecting = false

  constructor(private readonly options: SMB2ClientOptions) {}

  /**
   * Connect to SMB server and authenticate
   *
   * Establishes TCP connection, negotiates protocol, authenticates, and connects to share.
   * Usually not needed as the client auto-connects on first operation.
   *
   * @throws {SMB2ClientError} If connection or authentication fails
   *
   * @example
   * ```typescript
   * await client.connect()
   * console.log('Connected to', client.options.host)
   * ```
   */
  async connect(): Promise<void> {
    if (this.connected) return
    if (this.connecting) {
      throw new SMB2ClientError('Connection already in progress', 'EALREADY')
    }

    this.connecting = true
    try {
      // Create TCP connection
      this.connection = new SMB2Connection({
        host: this.options.host,
        port: this.options.port ?? 445,
        timeout: this.options.timeout ?? 10000,
      })

      await this.connection.connect()

      // Session setup (NEGOTIATE + SESSION_SETUP)
      this.sessionManager = new SessionManager(this.connection, {
        domain: this.options.domain ?? 'WORKGROUP',
        username: this.options.username,
        password: this.options.password,
        workstation: this.options.workstation ?? 'NODE-SMB2-CLIENT',
      })

      this.sessionId = await this.sessionManager.authenticate()

      // Tree connect to share
      this.treeManager = new TreeManager(this.connection, this.sessionId)
      const sharePath = `\\\\${this.options.host}\\${this.options.share}`
      this.treeId = await this.treeManager.connect(sharePath)

      this.connected = true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      // Log full error for debugging
      if (error instanceof Error) {
        console.error('SMB2Client connect error:', error)
        console.error('Stack:', error.stack)
      }
      throw new SMB2ClientError(
        `Connection failed: ${message}`,
        'ECONNREFUSED',
        undefined,
        'connect',
        undefined,
        error instanceof Error ? error : undefined,
      )
    } finally {
      this.connecting = false
    }
  }

  /**
   * Ensure connection is established
   *
   * Auto-connects if enabled and not connected.
   *
   * @private
   * @throws {SMB2ClientError} If not connected and auto-connect disabled
   */
  private async ensureConnected(): Promise<void> {
    if (!this.connected && (this.options.autoConnect ?? true)) {
      await this.connect()
    }
    if (!this.connected) {
      throw new SMB2ClientError('Not connected. Call connect() first.', 'ENOTCONN')
    }
  }

  /**
   * Read entire file into Buffer
   *
   * Reads file in chunks and concatenates into a single Buffer.
   * For large files, consider using createReadStream() to avoid loading entire file into memory.
   *
   * @param path - File path relative to share root (e.g., '/documents/report.pdf')
   * @param options - Read options (offset, length, chunkSize)
   * @returns File contents as Buffer
   * @throws {SMB2ClientError} If file doesn't exist or read fails
   *
   * @example
   * ```typescript
   * const content = await client.readFile('/readme.txt')
   * console.log(content.toString('utf8'))
   *
   * // Read specific range
   * const chunk = await client.readFile('/large.bin', { offset: 0n, length: 1024 })
   * ```
   */
  async readFile(path: string, options?: ReadFileOptions): Promise<Buffer> {
    await this.ensureConnected()

    // Open file for reading
    const createRequest = createCreateRequest(
      {
        path,
        desiredAccess: DesiredAccess.GENERIC_READ,
        fileAttributes: FileAttributes.NORMAL,
        shareAccess: ShareAccess.READ,
        createDisposition: CreateDisposition.OPEN,
        createOptions: 0,
      },
      this.sessionId!,
      this.treeId!,
    )

    const createResponse = await this.connection!.sendMessage(createRequest)
    if (!createResponse.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(createResponse.header.status, 'readFile', path)
    }

    const createData = parseCreateResponse(createResponse)
    const fileId = createData.fileId

    try {
      // Read file content
      return await readFile(this.connection!, fileId, this.sessionId!, this.treeId!, path, options)
    } finally {
      // Always close file
      const closeRequest = createCloseRequest({ fileId }, this.sessionId!, this.treeId!)
      await this.connection!.sendMessage(closeRequest)
    }
  }

  /**
   * Create Node.js Readable stream for file
   *
   * Returns a Readable stream that emits file chunks as they're read from the server.
   * More efficient than readFile() for large files.
   *
   * @param path - File path relative to share root
   * @param options - Read options (offset, length, chunkSize)
   * @returns Node.js Readable stream
   * @throws {SMB2ClientError} If file doesn't exist or stream fails
   *
   * @example
   * ```typescript
   * const stream = client.createReadStream('/large-file.zip')
   * stream.pipe(fs.createWriteStream('./download.zip'))
   *
   * stream.on('end', () => console.log('Download complete'))
   * stream.on('error', (err) => console.error('Error:', err))
   * ```
   */
  createReadStream(path: string, options?: ReadFileOptions): Readable {
    return Readable.from(this.createReadStreamGenerator(path, options))
  }

  /**
   * Internal: Async generator for streaming reads
   *
   * Opens file, yields chunks, then closes file.
   *
   * @private
   * @param path - File path
   * @param options - Read options
   * @yields File chunks as Buffers
   */
  private async *createReadStreamGenerator(
    path: string,
    options?: ReadFileOptions,
  ): AsyncGenerator<Buffer, void, undefined> {
    await this.ensureConnected()

    // Open file for reading
    const createRequest = createCreateRequest(
      {
        path,
        desiredAccess: DesiredAccess.GENERIC_READ,
        fileAttributes: FileAttributes.NORMAL,
        shareAccess: ShareAccess.READ,
        createDisposition: CreateDisposition.OPEN,
        createOptions: 0,
      },
      this.sessionId!,
      this.treeId!,
    )

    const createResponse = await this.connection!.sendMessage(createRequest)
    if (!createResponse.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(createResponse.header.status, 'createReadStream', path)
    }

    const createData = parseCreateResponse(createResponse)
    const fileId = createData.fileId

    try {
      // Stream file content
      yield* createFileReadStream(this.connection!, fileId, this.sessionId!, this.treeId!, path, options)
    } finally {
      // Always close file
      const closeRequest = createCloseRequest({ fileId }, this.sessionId!, this.treeId!)
      await this.connection!.sendMessage(closeRequest)
    }
  }

  /**
   * List directory contents
   *
   * Returns metadata for all files and subdirectories in the specified directory.
   * Does not recurse into subdirectories.
   *
   * @param path - Directory path relative to share root (e.g., '/documents')
   * @returns Array of file/directory metadata
   * @throws {SMB2ClientError} If directory doesn't exist or listing fails
   *
   * @example
   * ```typescript
   * const entries = await client.readdir('/documents')
   *
   * for (const entry of entries) {
   *   if (entry.isDirectory) {
   *     console.log('[DIR]', entry.name)
   *   } else {
   *     console.log('[FILE]', entry.name, entry.size.toString(), 'bytes')
   *   }
   * }
   * ```
   */
  async readdir(path: string): Promise<FileMetadata[]> {
    await this.ensureConnected()

    // Open directory for listing
    const createRequest = createCreateRequest(
      {
        path,
        desiredAccess: DesiredAccess.GENERIC_READ,
        fileAttributes: FileAttributes.NORMAL,
        shareAccess: ShareAccess.READ | ShareAccess.WRITE,
        createDisposition: CreateDisposition.OPEN,
        createOptions: CreateOptions.DIRECTORY_FILE,
      },
      this.sessionId!,
      this.treeId!,
    )

    const createResponse = await this.connection!.sendMessage(createRequest)
    if (!createResponse.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(createResponse.header.status, 'readdir', path)
    }

    const createData = parseCreateResponse(createResponse)
    const fileId = createData.fileId

    try {
      // Query directory contents
      return await readdir(this.connection!, fileId, this.sessionId!, this.treeId!, path)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new SMB2ClientError(
        `Read directory failed: ${message}`,
        'EIO',
        undefined,
        'readdir',
        path,
        error instanceof Error ? error : undefined,
      )
    } finally {
      // Always close directory
      const closeRequest = createCloseRequest({ fileId }, this.sessionId!, this.treeId!)
      await this.connection!.sendMessage(closeRequest)
    }
  }

  /**
   * Get file/directory metadata
   *
   * Returns detailed metadata for a single file or directory.
   *
   * @param path - File/directory path relative to share root
   * @returns File metadata
   * @throws {SMB2ClientError} If path doesn't exist or stat fails
   *
   * @example
   * ```typescript
   * const metadata = await client.stat('/documents/report.pdf')
   *
   * console.log('Name:', metadata.name)
   * console.log('Size:', metadata.size.toString(), 'bytes')
   * console.log('Modified:', metadata.modifiedAt)
   * console.log('Is directory:', metadata.isDirectory)
   * ```
   */
  async stat(path: string): Promise<FileMetadata> {
    await this.ensureConnected()

    // Open file/directory for querying
    const createRequest = createCreateRequest(
      {
        path,
        desiredAccess: DesiredAccess.GENERIC_READ,
        fileAttributes: FileAttributes.NORMAL,
        shareAccess: ShareAccess.READ,
        createDisposition: CreateDisposition.OPEN,
        createOptions: 0,
      },
      this.sessionId!,
      this.treeId!,
    )

    const createResponse = await this.connection!.sendMessage(createRequest)
    if (!createResponse.isSuccess()) {
      throw SMB2ClientError.fromSMBStatus(createResponse.header.status, 'stat', path)
    }

    const createData = parseCreateResponse(createResponse)
    const fileId = createData.fileId

    try {
      // Query file/directory info
      return await stat(this.connection!, fileId, this.sessionId!, this.treeId!, path)
    } finally {
      // Always close file/directory
      const closeRequest = createCloseRequest({ fileId }, this.sessionId!, this.treeId!)
      await this.connection!.sendMessage(closeRequest)
    }
  }

  /**
   * Disconnect from server and cleanup
   *
   * Disconnects from share, closes session, and closes TCP connection.
   *
   * @throws {SMB2ClientError} If disconnect fails
   *
   * @example
   * ```typescript
   * await client.disconnect()
   * console.log('Disconnected')
   * ```
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return

    try {
      this.treeManager?.disconnectAll()
      this.sessionManager?.invalidate()
      await this.connection?.close()
      this.connected = false
      this.sessionId = undefined
      this.treeId = undefined
      this.connection = undefined
      this.sessionManager = undefined
      this.treeManager = undefined
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new SMB2ClientError(
        `Disconnect failed: ${message}`,
        'EIO',
        undefined,
        'disconnect',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * Check connection status
   *
   * @returns true if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (!client.isConnected()) {
   *   await client.connect()
   * }
   * ```
   */
  isConnected(): boolean {
    return this.connected
  }
}
