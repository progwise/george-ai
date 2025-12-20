/**
 * SMB2 Message Serialization and Deserialization
 *
 * Handles encoding/decoding of SMB2 protocol messages including:
 * - NetBIOS Session Service header (4 bytes)
 * - SMB2 header (64 bytes fixed)
 * - Command-specific body
 */
import { Buffer } from 'node:buffer'

import { NETBIOS_HEADER_SIZE, NTStatus, SMB2Command, SMB2Flags, SMB2_HEADER_SIZE, SMB2_PROTOCOL_ID } from './constants'
import type { SMB2Header } from './types'

/**
 * SMB2 Message
 *
 * Represents a complete SMB2 message with header and body
 */
export class SMB2Message {
  /** SMB2 header (64 bytes) */
  header: SMB2Header
  /** Command-specific body */
  body: Buffer

  constructor(header: SMB2Header, body: Buffer = Buffer.alloc(0)) {
    this.header = header
    this.body = body
  }

  /**
   * Serialize message to wire format
   *
   * Format:
   * - NetBIOS Session Service header (4 bytes)
   * - SMB2 header (64 bytes)
   * - Command body (variable)
   */
  toBuffer(): Buffer {
    const headerBuffer = this.serializeHeader()
    const totalLength = headerBuffer.length + this.body.length

    // NetBIOS Session Service header
    const netbiosHeader = Buffer.alloc(NETBIOS_HEADER_SIZE)
    netbiosHeader.writeUInt8(0x00, 0) // Message type (session message)
    netbiosHeader.writeUIntBE(totalLength, 1, 3) // 24-bit length

    return Buffer.concat([netbiosHeader, headerBuffer, this.body])
  }

  /**
   * Serialize SMB2 header to buffer (64 bytes)
   */
  private serializeHeader(): Buffer {
    const buffer = Buffer.alloc(SMB2_HEADER_SIZE)
    let offset = 0

    // Protocol ID (4 bytes): \xFESMB
    SMB2_PROTOCOL_ID.copy(buffer, offset)
    offset += 4

    // Structure size (2 bytes): must be 64
    buffer.writeUInt16LE(SMB2_HEADER_SIZE, offset)
    offset += 2

    // Credit charge (2 bytes)
    buffer.writeUInt16LE(this.header.creditCharge, offset)
    offset += 2

    // Channel sequence / Status (4 bytes)
    // For requests: channel sequence (SMB 3.x)
    // For responses: NT status code
    buffer.writeUInt32LE(this.header.status ?? this.header.channelSequence ?? 0, offset)
    offset += 4

    // Command (2 bytes)
    buffer.writeUInt16LE(this.header.command, offset)
    offset += 2

    // Credit request/response (2 bytes)
    buffer.writeUInt16LE(this.header.creditRequest, offset)
    offset += 2

    // Flags (4 bytes)
    buffer.writeUInt32LE(this.header.flags, offset)
    offset += 4

    // Next command offset (4 bytes) - for compound requests
    buffer.writeUInt32LE(this.header.nextCommand, offset)
    offset += 4

    // Message ID (8 bytes)
    buffer.writeBigUInt64LE(this.header.messageId, offset)
    offset += 8

    // Reserved (4 bytes) - MUST be 0
    buffer.writeUInt32LE(0, offset)
    offset += 4

    // Tree ID (4 bytes)
    buffer.writeUInt32LE(this.header.treeId, offset)
    offset += 4

    // Session ID (8 bytes)
    buffer.writeBigUInt64LE(this.header.sessionId, offset)
    offset += 8

    // Signature (16 bytes) - zeros if not signed
    if (this.header.signature) {
      this.header.signature.copy(buffer, offset, 0, 16)
    } else {
      buffer.fill(0, offset, offset + 16)
    }
    offset += 16

    return buffer
  }

  /**
   * Deserialize message from wire format
   *
   * @param data - Buffer containing NetBIOS + SMB2 message
   * @returns Parsed SMB2Message
   */
  static fromBuffer(data: Buffer): SMB2Message {
    if (data.length < NETBIOS_HEADER_SIZE + SMB2_HEADER_SIZE) {
      throw new Error(
        `Invalid SMB2 message: too short (${data.length} bytes, need at least ${NETBIOS_HEADER_SIZE + SMB2_HEADER_SIZE})`,
      )
    }

    // Skip NetBIOS header (4 bytes)
    let offset = NETBIOS_HEADER_SIZE

    // Parse SMB2 header
    const header = this.deserializeHeader(data.subarray(offset, offset + SMB2_HEADER_SIZE))
    offset += SMB2_HEADER_SIZE

    // Extract body (remaining bytes)
    const body = data.subarray(offset)

    return new SMB2Message(header, body)
  }

  /**
   * Deserialize SMB2 header from buffer
   */
  private static deserializeHeader(buffer: Buffer): SMB2Header {
    if (buffer.length !== SMB2_HEADER_SIZE) {
      throw new Error(`Invalid SMB2 header size: ${buffer.length} (expected ${SMB2_HEADER_SIZE})`)
    }

    let offset = 0

    // Protocol ID (4 bytes)
    const protocolId = buffer.subarray(offset, offset + 4)
    offset += 4

    if (!protocolId.equals(SMB2_PROTOCOL_ID)) {
      throw new Error(
        `Invalid SMB2 protocol ID: ${protocolId.toString('hex')} (expected ${SMB2_PROTOCOL_ID.toString('hex')})`,
      )
    }

    // Structure size (2 bytes)
    const structureSize = buffer.readUInt16LE(offset)
    offset += 2

    if (structureSize !== SMB2_HEADER_SIZE) {
      throw new Error(`Invalid structure size: ${structureSize} (expected ${SMB2_HEADER_SIZE})`)
    }

    // Credit charge (2 bytes)
    const creditCharge = buffer.readUInt16LE(offset)
    offset += 2

    // Status / Channel sequence (4 bytes)
    const statusOrChannel = buffer.readUInt32LE(offset)
    offset += 4

    // Command (2 bytes)
    const command = buffer.readUInt16LE(offset) as SMB2Command
    offset += 2

    // Credit request/response (2 bytes)
    const creditRequest = buffer.readUInt16LE(offset)
    offset += 2

    // Flags (4 bytes)
    const flags = buffer.readUInt32LE(offset)
    offset += 4

    // Determine if this is a response (check SERVER_TO_REDIR flag)
    const isResponse = (flags & SMB2Flags.SERVER_TO_REDIR) !== 0

    // Next command offset (4 bytes)
    const nextCommand = buffer.readUInt32LE(offset)
    offset += 4

    // Message ID (8 bytes)
    const messageId = buffer.readBigUInt64LE(offset)
    offset += 8

    // Reserved (4 bytes) - MUST be 0
    const reserved = buffer.readUInt32LE(offset)
    offset += 4

    // Tree ID (4 bytes)
    const treeId = buffer.readUInt32LE(offset)
    offset += 4

    // Session ID (8 bytes)
    const sessionId = buffer.readBigUInt64LE(offset)
    offset += 8

    // Signature (16 bytes)
    const signature = buffer.subarray(offset, offset + 16)
    offset += 16

    return {
      protocolId,
      structureSize,
      creditCharge,
      channelSequence: isResponse ? 0 : statusOrChannel,
      status: isResponse ? (statusOrChannel as NTStatus) : NTStatus.SUCCESS,
      command,
      creditRequest,
      flags,
      nextCommand,
      messageId,
      reserved,
      treeId,
      sessionId,
      signature,
    }
  }

  /**
   * Check if message is a response (server to client)
   */
  isResponse(): boolean {
    return (this.header.flags & SMB2Flags.SERVER_TO_REDIR) !== 0
  }

  /**
   * Check if message is signed
   */
  isSigned(): boolean {
    return (this.header.flags & SMB2Flags.SIGNED) !== 0
  }

  /**
   * Check if message status indicates success
   */
  isSuccess(): boolean {
    return this.header.status === NTStatus.SUCCESS
  }

  /**
   * Check if message status indicates more processing required (e.g., NTLM negotiation)
   */
  isMoreProcessingRequired(): boolean {
    return this.header.status === NTStatus.MORE_PROCESSING_REQUIRED
  }

  /**
   * Get status code as string
   */
  getStatusString(): string {
    return NTStatus[this.header.status] ?? `Unknown (0x${this.header.status.toString(16)})`
  }

  /**
   * Create a response message for a given request
   */
  static createResponse(request: SMB2Message, body: Buffer, status: NTStatus = NTStatus.SUCCESS): SMB2Message {
    const header: SMB2Header = {
      ...request.header,
      status,
      flags: request.header.flags | SMB2Flags.SERVER_TO_REDIR,
      channelSequence: 0,
    }

    return new SMB2Message(header, body)
  }

  /**
   * Create a request message
   */
  static createRequest(
    command: SMB2Command,
    body: Buffer,
    options: {
      messageId?: bigint
      sessionId?: bigint
      treeId?: number
      creditRequest?: number
      flags?: number
    } = {},
  ): SMB2Message {
    const header: SMB2Header = {
      protocolId: SMB2_PROTOCOL_ID,
      structureSize: SMB2_HEADER_SIZE,
      creditCharge: 1,
      channelSequence: 0,
      status: NTStatus.SUCCESS,
      command,
      creditRequest: options.creditRequest ?? 1,
      flags: options.flags ?? 0,
      nextCommand: 0,
      messageId: options.messageId ?? 0n,
      reserved: 0,
      treeId: options.treeId ?? 0,
      sessionId: options.sessionId ?? 0n,
      signature: Buffer.alloc(16),
    }

    return new SMB2Message(header, body)
  }
}
