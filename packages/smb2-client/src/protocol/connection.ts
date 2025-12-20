/**
 * SMB2 TCP Connection Management
 *
 * Handles TCP socket connections to SMB servers and manages
 * the send/receive of SMB2 messages over NetBIOS Session Service.
 */
import { EventEmitter } from 'node:events'
import { Socket } from 'node:net'

import { NETBIOS_HEADER_SIZE } from './constants'
import { SMB2Message } from './message'

/**
 * Connection options
 */
export interface SMB2ConnectionOptions {
  /** Server hostname or IP address */
  host: string
  /** Server port (default: 445) */
  port?: number
  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number
}

/**
 * SMB2 Connection
 *
 * Manages TCP connection to SMB server and handles message framing.
 *
 * Events:
 * - 'connect': Connection established
 * - 'close': Connection closed
 * - 'error': Error occurred
 * - 'message': Message received
 */
export class SMB2Connection extends EventEmitter {
  private socket: Socket | null = null
  private host: string
  private port: number
  private timeout: number
  private connected = false
  private buffer = Buffer.alloc(0)
  private pendingResponses = new Map<bigint, (message: SMB2Message) => void>()
  private messageIdCounter = 0n

  constructor(options: SMB2ConnectionOptions) {
    super()
    this.host = options.host
    this.port = options.port ?? 445
    this.timeout = options.timeout ?? 10000
  }

  /**
   * Connect to SMB server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      throw new Error('Already connected')
    }

    return new Promise((resolve, reject) => {
      const socket = new Socket()
      this.socket = socket

      // Set timeout
      socket.setTimeout(this.timeout)

      // Connection established
      socket.on('connect', () => {
        this.connected = true
        socket.setTimeout(0) // Disable timeout after connection
        this.emit('connect')
        resolve()
      })

      // Data received
      socket.on('data', (data: Buffer) => {
        this.handleData(data)
      })

      // Connection closed
      socket.on('close', () => {
        this.connected = false
        this.socket = null
        this.emit('close')
      })

      // Error occurred
      socket.on('error', (error: Error) => {
        this.emit('error', error)
        if (!this.connected) {
          reject(error)
        }
      })

      // Timeout
      socket.on('timeout', () => {
        const error = new Error(`Connection timeout after ${this.timeout}ms`)
        socket.destroy()
        reject(error)
      })

      // Connect to server
      socket.connect(this.port, this.host)
    })
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (!this.socket) {
      return
    }

    return new Promise((resolve) => {
      this.socket!.once('close', () => {
        resolve()
      })
      this.socket!.end()
    })
  }

  /**
   * Send message and wait for response
   *
   * @param message - SMB2 message to send
   * @returns Promise that resolves with the response message
   */
  async sendMessage(message: SMB2Message): Promise<SMB2Message> {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected')
    }

    // Assign message ID if not set
    if (message.header.messageId === 0n) {
      message.header.messageId = this.nextMessageId()
    }

    // Serialize and send
    const buffer = message.toBuffer()

    return new Promise((resolve, reject) => {
      // Register response handler
      this.pendingResponses.set(message.header.messageId, resolve)

      // Set timeout for response
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(message.header.messageId)
        reject(new Error(`Response timeout for message ${message.header.messageId}`))
      }, this.timeout)

      // Send message
      this.socket!.write(buffer, (error) => {
        if (error) {
          clearTimeout(timeoutId)
          this.pendingResponses.delete(message.header.messageId)
          reject(error)
        }
      })

      // Clear timeout when response arrives
      const originalResolve = resolve
      this.pendingResponses.set(message.header.messageId, (response: SMB2Message) => {
        clearTimeout(timeoutId)
        originalResolve(response)
      })
    })
  }

  /**
   * Handle incoming data from socket
   */
  private handleData(data: Buffer): void {
    // Append to buffer
    this.buffer = Buffer.concat([this.buffer, data])

    // Process complete messages
    while (this.buffer.length >= NETBIOS_HEADER_SIZE) {
      // Read NetBIOS header to get message length
      const messageType = this.buffer.readUInt8(0)
      const messageLength = this.buffer.readUIntBE(1, 3)
      const totalLength = NETBIOS_HEADER_SIZE + messageLength

      // Check if we have a complete message
      if (this.buffer.length < totalLength) {
        break // Wait for more data
      }

      // Extract message
      const messageBuffer = this.buffer.subarray(0, totalLength)
      this.buffer = this.buffer.subarray(totalLength)

      // Validate NetBIOS message type
      if (messageType !== 0x00) {
        this.emit('error', new Error(`Invalid NetBIOS message type: 0x${messageType.toString(16)}`))
        continue
      }

      // Parse SMB2 message
      try {
        const message = SMB2Message.fromBuffer(messageBuffer)
        this.handleMessage(message)
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error(String(error)))
      }
    }
  }

  /**
   * Handle received SMB2 message
   */
  private handleMessage(message: SMB2Message): void {
    // Emit message event
    this.emit('message', message)

    // Check if this is a response to a pending request
    const handler = this.pendingResponses.get(message.header.messageId)
    if (handler) {
      this.pendingResponses.delete(message.header.messageId)
      handler(message)
    }
  }

  /**
   * Get next message ID
   */
  private nextMessageId(): bigint {
    return this.messageIdCounter++
  }

  /**
   * Check if connection is active
   */
  isConnected(): boolean {
    return this.connected && this.socket !== null
  }

  /**
   * Get connection info
   */
  getInfo(): { host: string; port: number; connected: boolean } {
    return {
      host: this.host,
      port: this.port,
      connected: this.connected,
    }
  }
}
