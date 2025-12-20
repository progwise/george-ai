/**
 * SMB2 SESSION_SETUP Command
 *
 * The SESSION_SETUP command is used to authenticate a user session.
 * This implementation uses NTLM v2 authentication.
 *
 * Reference:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/5c5e5b77-b998-4f43-afa1-22842ca38718
 */
import { createType1Message, createType3Message, parseType2Message } from '../../auth/ntlm'
import type { NTLMCredentials } from '../../auth/types'
import { SMB2Command, SMB2SecurityMode, SMB2SessionFlags } from '../constants'
import { SMB2Message } from '../message'
import type { SessionSetupResponse } from '../types'

/**
 * Create SESSION_SETUP request with NTLM Type 1 (NEGOTIATE)
 *
 * @param domain - Domain name
 * @param workstation - Workstation name
 * @returns SMB2 SESSION_SETUP request with NTLM Type 1
 */
export function createSessionSetupRequest1(domain: string, workstation: string): SMB2Message {
  // Create NTLM Type 1 message
  const ntlmType1 = createType1Message(domain, workstation)

  // Calculate offsets
  const structureSize = 25
  const securityBufferOffset = 64 + 24 // SMB2 header + SESSION_SETUP header
  const securityBufferLength = ntlmType1.length

  const body = Buffer.alloc(structureSize - 1 + securityBufferLength) // -1 because Buffer is variable
  let offset = 0

  // StructureSize (2 bytes): MUST be 25
  body.writeUInt16LE(structureSize, offset)
  offset += 2

  // Flags (1 byte): 0
  body.writeUInt8(0, offset)
  offset += 1

  // SecurityMode (1 byte)
  body.writeUInt8(SMB2SecurityMode.SIGNING_ENABLED, offset)
  offset += 1

  // Capabilities (4 bytes): 0
  body.writeUInt32LE(0, offset)
  offset += 4

  // Channel (4 bytes): 0
  body.writeUInt32LE(0, offset)
  offset += 4

  // SecurityBufferOffset (2 bytes)
  body.writeUInt16LE(securityBufferOffset, offset)
  offset += 2

  // SecurityBufferLength (2 bytes)
  body.writeUInt16LE(securityBufferLength, offset)
  offset += 2

  // PreviousSessionId (8 bytes): 0
  body.writeBigUInt64LE(0n, offset)
  offset += 8

  // SecurityBuffer (variable)
  ntlmType1.copy(body, offset)
  offset += ntlmType1.length

  // Create message
  return SMB2Message.createRequest(SMB2Command.SESSION_SETUP, body)
}

/**
 * Create SESSION_SETUP request with NTLM Type 3 (AUTHENTICATE)
 *
 * @param credentials - User credentials
 * @param workstation - Workstation name
 * @param type2Response - SESSION_SETUP response containing NTLM Type 2
 * @returns SMB2 SESSION_SETUP request with NTLM Type 3
 */
export function createSessionSetupRequest3(
  credentials: NTLMCredentials,
  workstation: string,
  type2Response: SessionSetupResponse,
): SMB2Message {
  // Parse NTLM Type 2 from response
  const ntlmType2 = parseType2Message(type2Response.securityBuffer)

  // Create NTLM Type 3 message
  const ntlmType3 = createType3Message(credentials, ntlmType2, workstation)

  // Calculate offsets
  const structureSize = 25
  const securityBufferOffset = 64 + 24 // SMB2 header + SESSION_SETUP header
  const securityBufferLength = ntlmType3.length

  const body = Buffer.alloc(structureSize - 1 + securityBufferLength) // -1 because Buffer is variable
  let offset = 0

  // StructureSize (2 bytes): MUST be 25
  body.writeUInt16LE(structureSize, offset)
  offset += 2

  // Flags (1 byte): 0
  body.writeUInt8(0, offset)
  offset += 1

  // SecurityMode (1 byte)
  body.writeUInt8(SMB2SecurityMode.SIGNING_ENABLED, offset)
  offset += 1

  // Capabilities (4 bytes): 0
  body.writeUInt32LE(0, offset)
  offset += 4

  // Channel (4 bytes): 0
  body.writeUInt32LE(0, offset)
  offset += 4

  // SecurityBufferOffset (2 bytes)
  body.writeUInt16LE(securityBufferOffset, offset)
  offset += 2

  // SecurityBufferLength (2 bytes)
  body.writeUInt16LE(securityBufferLength, offset)
  offset += 2

  // PreviousSessionId (8 bytes): 0
  body.writeBigUInt64LE(0n, offset)
  offset += 8

  // SecurityBuffer (variable)
  ntlmType3.copy(body, offset)
  offset += ntlmType3.length

  // Create message
  return SMB2Message.createRequest(SMB2Command.SESSION_SETUP, body)
}

/**
 * Parse SESSION_SETUP response
 *
 * @param message - SMB2 SESSION_SETUP response message
 * @returns Parsed SESSION_SETUP response
 */
export function parseSessionSetupResponse(message: SMB2Message): SessionSetupResponse {
  if (!message.isResponse()) {
    throw new Error('Expected SESSION_SETUP response')
  }

  if (message.header.command !== SMB2Command.SESSION_SETUP) {
    throw new Error(`Expected SESSION_SETUP response, got command ${message.header.command}`)
  }

  // Check status - accept both SUCCESS and MORE_PROCESSING_REQUIRED
  // MORE_PROCESSING_REQUIRED means NTLM negotiation continues (Type 2 response)
  if (!message.isSuccess() && !message.isMoreProcessingRequired()) {
    throw new Error(`SESSION_SETUP failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 9
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 9) {
    throw new Error(`Invalid SESSION_SETUP response structure size: ${structureSize} (expected 9)`)
  }

  // SessionFlags (2 bytes)
  const sessionFlags = body.readUInt16LE(offset)
  offset += 2

  // SecurityBufferOffset (2 bytes)
  const securityBufferOffset = body.readUInt16LE(offset)
  offset += 2

  // SecurityBufferLength (2 bytes)
  const securityBufferLength = body.readUInt16LE(offset)
  offset += 2

  // SecurityBuffer (variable)
  let securityBuffer = Buffer.alloc(0)
  if (securityBufferLength > 0 && securityBufferOffset > 0) {
    // Offset is from start of SMB2 header, so we need to adjust for body start
    const bufferStart = securityBufferOffset - 64 // SMB2 header size
    securityBuffer = Buffer.from(body.subarray(bufferStart, bufferStart + securityBufferLength))
  }

  return {
    structureSize,
    sessionFlags,
    securityBufferOffset,
    securityBufferLength,
    securityBuffer,
  }
}

/**
 * Check if session is guest
 */
export function isGuestSession(sessionFlags: number): boolean {
  return (sessionFlags & SMB2SessionFlags.IS_GUEST) !== 0
}

/**
 * Check if session is null (anonymous)
 */
export function isNullSession(sessionFlags: number): boolean {
  return (sessionFlags & SMB2SessionFlags.IS_NULL) !== 0
}

/**
 * Check if session requires encryption
 */
export function requiresEncryption(sessionFlags: number): boolean {
  return (sessionFlags & SMB2SessionFlags.ENCRYPT_DATA) !== 0
}
