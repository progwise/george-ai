/**
 * NTLM v2 Authentication Implementation
 *
 * Implements the NTLM authentication protocol for SMB2.
 * This is a zero-dependency implementation using only Node.js crypto.
 *
 * Protocol flow:
 * 1. Client sends Type 1 (NEGOTIATE) message
 * 2. Server responds with Type 2 (CHALLENGE) message
 * 3. Client sends Type 3 (AUTHENTICATE) message with NTLMv2 response
 *
 * References:
 * - https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/
 */
import { randomBytes } from 'node:crypto'

import { hmacMd5 } from './hmac-md5'
import { ntHash } from './md4'
import { type AVPair, AVPairType, type NTLMChallenge, type NTLMCredentials, NTLMFlags, NTLMMessageType } from './types'

/** NTLM Signature */
const NTLM_SIGNATURE = Buffer.from('NTLMSSP\0', 'binary')

/**
 * Create NTLM Type 1 (NEGOTIATE) message
 *
 * @param domain - Domain name
 * @param workstation - Workstation name
 * @returns NTLM Type 1 message buffer
 */
export function createType1Message(domain: string, workstation: string): Buffer {
  // Flags for NTLMv2
  const flags =
    NTLMFlags.NEGOTIATE_UNICODE |
    NTLMFlags.NEGOTIATE_NTLM |
    NTLMFlags.REQUEST_TARGET |
    NTLMFlags.NEGOTIATE_EXTENDED_SECURITY |
    NTLMFlags.NEGOTIATE_ALWAYS_SIGN |
    NTLMFlags.NEGOTIATE_128 |
    NTLMFlags.NEGOTIATE_56

  // Calculate message length (no domain/workstation in modern NTLM)
  const messageLength = 32 // Fixed size for Type 1

  const buffer = Buffer.alloc(messageLength)
  let offset = 0

  // Signature (8 bytes): "NTLMSSP\0"
  NTLM_SIGNATURE.copy(buffer, offset)
  offset += 8

  // Message type (4 bytes): 1 = NEGOTIATE
  buffer.writeUInt32LE(NTLMMessageType.NEGOTIATE, offset)
  offset += 4

  // Flags (4 bytes)
  buffer.writeUInt32LE(flags, offset)
  offset += 4

  // Domain name fields (8 bytes) - empty in modern NTLM
  buffer.writeUInt16LE(0, offset) // Length
  buffer.writeUInt16LE(0, offset + 2) // MaxLength
  buffer.writeUInt32LE(0, offset + 4) // Offset
  offset += 8

  // Workstation name fields (8 bytes) - empty in modern NTLM
  buffer.writeUInt16LE(0, offset) // Length
  buffer.writeUInt16LE(0, offset + 2) // MaxLength
  buffer.writeUInt32LE(0, offset + 4) // Offset
  offset += 8

  return buffer
}

/**
 * Parse NTLM Type 2 (CHALLENGE) message
 *
 * @param buffer - NTLM Type 2 message buffer
 * @returns Parsed challenge information
 */
export function parseType2Message(buffer: Buffer): NTLMChallenge {
  let offset = 0

  // Verify signature
  const signature = buffer.subarray(offset, offset + 8)
  offset += 8
  if (!signature.equals(NTLM_SIGNATURE)) {
    throw new Error('Invalid NTLM signature')
  }

  // Message type
  const messageType = buffer.readUInt32LE(offset)
  offset += 4
  if (messageType !== NTLMMessageType.CHALLENGE) {
    throw new Error(`Expected CHALLENGE message, got ${messageType}`)
  }

  // Target name (domain/server)
  const targetNameLength = buffer.readUInt16LE(offset)
  offset += 2
  offset += 2 // MaxLength
  const targetNameOffset = buffer.readUInt32LE(offset)
  offset += 4

  // Flags
  const flags = buffer.readUInt32LE(offset)
  offset += 4

  // Server challenge (8 bytes)
  const challenge = buffer.subarray(offset, offset + 8)
  offset += 8

  // Reserved (8 bytes)
  offset += 8

  // Target info
  const targetInfoLength = buffer.readUInt16LE(offset)
  offset += 2
  offset += 2 // MaxLength
  const targetInfoOffset = buffer.readUInt32LE(offset)
  offset += 4

  // Extract target name if present
  let targetName: string | undefined
  if (targetNameLength > 0 && targetNameOffset > 0) {
    const targetNameBuffer = buffer.subarray(targetNameOffset, targetNameOffset + targetNameLength)
    targetName = targetNameBuffer.toString('utf16le')
  }

  // Extract target info if present
  let targetInfo: Buffer | undefined
  if (targetInfoLength > 0 && targetInfoOffset > 0) {
    targetInfo = buffer.subarray(targetInfoOffset, targetInfoOffset + targetInfoLength)
  }

  return {
    challenge,
    flags,
    targetName,
    targetInfo,
  }
}

/**
 * Create NTLM Type 3 (AUTHENTICATE) message
 *
 * @param credentials - User credentials
 * @param challenge - Challenge from Type 2 message
 * @param workstation - Workstation name
 * @returns NTLM Type 3 message buffer
 */
export function createType3Message(
  credentials: NTLMCredentials,
  challenge: NTLMChallenge,
  workstation: string,
): Buffer {
  // Calculate NT hash
  const ntHashValue = ntHash(credentials.password)

  // Calculate NTLMv2 hash
  const ntlmv2Hash = calculateNTLMv2Hash(ntHashValue, credentials.username, credentials.domain)

  // Generate client challenge (8 bytes random)
  const clientChallenge = randomBytes(8)

  // Get current timestamp (Windows FILETIME format)
  const timestamp = getWindowsTimestamp()

  // Build temp blob for NTLMv2 response
  const temp = buildTempBlob(timestamp, clientChallenge, challenge.targetInfo || Buffer.alloc(0))

  // Calculate NTLMv2 response
  const ntProofStr = hmacMd5(ntlmv2Hash, Buffer.concat([challenge.challenge, temp]))
  const ntChallengeResponse = Buffer.concat([ntProofStr, temp])

  // Create LMv2 response (simplified - uses same approach as NTLMv2)
  const lmChallengeResponse = calculateLMv2Response(ntlmv2Hash, challenge.challenge, clientChallenge)

  // Convert strings to UTF-16LE
  const domainBuffer = Buffer.from(credentials.domain.toUpperCase(), 'utf16le')
  const usernameBuffer = Buffer.from(credentials.username, 'utf16le')
  const workstationBuffer = Buffer.from(workstation.toUpperCase(), 'utf16le')

  // Empty encrypted session key
  const encryptedSessionKey = Buffer.alloc(0)

  // Calculate payload offsets
  const baseOffset = 64 // Type 3 header size
  let currentOffset = baseOffset

  const lmChallengeResponseOffset = currentOffset
  currentOffset += lmChallengeResponse.length

  const ntChallengeResponseOffset = currentOffset
  currentOffset += ntChallengeResponse.length

  const domainOffset = currentOffset
  currentOffset += domainBuffer.length

  const usernameOffset = currentOffset
  currentOffset += usernameBuffer.length

  const workstationOffset = currentOffset
  currentOffset += workstationBuffer.length

  const sessionKeyOffset = currentOffset
  currentOffset += encryptedSessionKey.length

  // Build Type 3 message
  const buffer = Buffer.alloc(currentOffset)
  let offset = 0

  // Signature (8 bytes)
  NTLM_SIGNATURE.copy(buffer, offset)
  offset += 8

  // Message type (4 bytes): 3 = AUTHENTICATE
  buffer.writeUInt32LE(NTLMMessageType.AUTHENTICATE, offset)
  offset += 4

  // LM challenge response fields
  buffer.writeUInt16LE(lmChallengeResponse.length, offset)
  buffer.writeUInt16LE(lmChallengeResponse.length, offset + 2)
  buffer.writeUInt32LE(lmChallengeResponseOffset, offset + 4)
  offset += 8

  // NT challenge response fields
  buffer.writeUInt16LE(ntChallengeResponse.length, offset)
  buffer.writeUInt16LE(ntChallengeResponse.length, offset + 2)
  buffer.writeUInt32LE(ntChallengeResponseOffset, offset + 4)
  offset += 8

  // Domain name fields
  buffer.writeUInt16LE(domainBuffer.length, offset)
  buffer.writeUInt16LE(domainBuffer.length, offset + 2)
  buffer.writeUInt32LE(domainOffset, offset + 4)
  offset += 8

  // Username fields
  buffer.writeUInt16LE(usernameBuffer.length, offset)
  buffer.writeUInt16LE(usernameBuffer.length, offset + 2)
  buffer.writeUInt32LE(usernameOffset, offset + 4)
  offset += 8

  // Workstation fields
  buffer.writeUInt16LE(workstationBuffer.length, offset)
  buffer.writeUInt16LE(workstationBuffer.length, offset + 2)
  buffer.writeUInt32LE(workstationOffset, offset + 4)
  offset += 8

  // Encrypted session key fields
  buffer.writeUInt16LE(encryptedSessionKey.length, offset)
  buffer.writeUInt16LE(encryptedSessionKey.length, offset + 2)
  buffer.writeUInt32LE(sessionKeyOffset, offset + 4)
  offset += 8

  // Flags
  const flags =
    NTLMFlags.NEGOTIATE_UNICODE |
    NTLMFlags.NEGOTIATE_NTLM |
    NTLMFlags.REQUEST_TARGET |
    NTLMFlags.NEGOTIATE_EXTENDED_SECURITY |
    NTLMFlags.NEGOTIATE_ALWAYS_SIGN |
    NTLMFlags.NEGOTIATE_128 |
    NTLMFlags.NEGOTIATE_56
  buffer.writeUInt32LE(flags, offset)
  offset += 4

  // Copy payload data
  lmChallengeResponse.copy(buffer, lmChallengeResponseOffset)
  ntChallengeResponse.copy(buffer, ntChallengeResponseOffset)
  domainBuffer.copy(buffer, domainOffset)
  usernameBuffer.copy(buffer, usernameOffset)
  workstationBuffer.copy(buffer, workstationOffset)

  return buffer
}

/**
 * Calculate NTLMv2 hash
 *
 * NTLMv2 = HMAC-MD5(NT_HASH, UPPERCASE(username) + domain)
 */
function calculateNTLMv2Hash(ntHashValue: Buffer, username: string, domain: string): Buffer {
  const identity = Buffer.from(username.toUpperCase() + domain.toUpperCase(), 'utf16le')
  return hmacMd5(ntHashValue, identity)
}

/**
 * Build temp blob for NTLMv2 response
 */
function buildTempBlob(timestamp: Buffer, clientChallenge: Buffer, targetInfo: Buffer): Buffer {
  const blobSignature = Buffer.from([0x01, 0x01, 0x00, 0x00]) // Blob signature
  const reserved = Buffer.from([0x00, 0x00, 0x00, 0x00]) // Reserved

  return Buffer.concat([
    blobSignature,
    reserved,
    timestamp,
    clientChallenge,
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // Unknown
    targetInfo,
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // Unknown
  ])
}

/**
 * Calculate LMv2 response
 */
function calculateLMv2Response(ntlmv2Hash: Buffer, serverChallenge: Buffer, clientChallenge: Buffer): Buffer {
  const response = hmacMd5(ntlmv2Hash, Buffer.concat([serverChallenge, clientChallenge]))
  return Buffer.concat([response, clientChallenge])
}

/**
 * Get current time in Windows FILETIME format
 *
 * FILETIME is 100-nanosecond intervals since January 1, 1601 UTC
 */
function getWindowsTimestamp(): Buffer {
  const now = Date.now()
  // Convert to 100-nanosecond intervals
  // Unix epoch (1970-01-01) to Windows epoch (1601-01-01) = 11644473600 seconds
  const windowsEpochDiff = 11644473600n * 10000000n
  const timestamp = BigInt(now) * 10000n + windowsEpochDiff

  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(timestamp)
  return buffer
}

/**
 * Parse AV_PAIR structures from target info
 */
export function parseAVPairs(targetInfo: Buffer): AVPair[] {
  const pairs: AVPair[] = []
  let offset = 0

  while (offset < targetInfo.length) {
    const type = targetInfo.readUInt16LE(offset) as AVPairType
    offset += 2

    const length = targetInfo.readUInt16LE(offset)
    offset += 2

    if (type === AVPairType.EOL) {
      break
    }

    const value = targetInfo.subarray(offset, offset + length)
    offset += length

    pairs.push({ type, length, value })
  }

  return pairs
}
