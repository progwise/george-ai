/**
 * SMB2 TREE_CONNECT Command
 *
 * The TREE_CONNECT command is used to connect to a share on the server.
 * Must be called after successful SESSION_SETUP.
 *
 * Reference:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/3907f3a2-e1a8-4c34-bbcf-5c56eab18da9
 */
import { SMB2Command } from '../constants'
import { SMB2Message } from '../message'
import type { TreeConnectResponse } from '../types'

/**
 * Create TREE_CONNECT request message
 *
 * @param sharePath - UNC path to share (e.g., '\\server\share')
 * @param sessionId - Session ID from SESSION_SETUP
 * @returns SMB2 TREE_CONNECT request message
 */
export function createTreeConnectRequest(sharePath: string, sessionId: bigint): SMB2Message {
  // Convert path to UTF-16LE
  const pathBuffer = Buffer.from(sharePath, 'utf16le')

  // Calculate offsets
  const structureSize = 9
  const pathOffset = 64 + 8 // SMB2 header + TREE_CONNECT header
  const pathLength = pathBuffer.length

  const body = Buffer.alloc(structureSize + pathLength)
  let offset = 0

  // StructureSize (2 bytes): MUST be 9
  body.writeUInt16LE(structureSize, offset)
  offset += 2

  // Flags (2 bytes): Reserved for SMB 3.1.1
  body.writeUInt16LE(0, offset)
  offset += 2

  // PathOffset (2 bytes)
  body.writeUInt16LE(pathOffset, offset)
  offset += 2

  // PathLength (2 bytes)
  body.writeUInt16LE(pathLength, offset)
  offset += 2

  // Path (variable, UTF-16LE)
  pathBuffer.copy(body, offset)

  // Create message with session ID
  return SMB2Message.createRequest(SMB2Command.TREE_CONNECT, body, {
    sessionId,
  })
}

/**
 * Parse TREE_CONNECT response message
 *
 * @param message - SMB2 TREE_CONNECT response message
 * @returns Parsed TREE_CONNECT response
 */
export function parseTreeConnectResponse(message: SMB2Message): TreeConnectResponse {
  if (!message.isResponse()) {
    throw new Error('Expected TREE_CONNECT response')
  }

  if (message.header.command !== SMB2Command.TREE_CONNECT) {
    throw new Error(`Expected TREE_CONNECT response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`TREE_CONNECT failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 16
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 16) {
    throw new Error(`Invalid TREE_CONNECT response structure size: ${structureSize} (expected 16)`)
  }

  // ShareType (1 byte)
  const shareType = body.readUInt8(offset)
  offset += 1

  // Reserved (1 byte)
  const reserved = body.readUInt8(offset)
  offset += 1

  // ShareFlags (4 bytes)
  const shareFlags = body.readUInt32LE(offset)
  offset += 4

  // Capabilities (4 bytes)
  const capabilities = body.readUInt32LE(offset)
  offset += 4

  // MaximalAccess (4 bytes)
  const maximalAccess = body.readUInt32LE(offset)

  return {
    structureSize,
    shareType,
    reserved,
    shareFlags,
    capabilities,
    maximalAccess,
  }
}

/**
 * Get share type name
 */
export function getShareTypeName(shareType: number): string {
  switch (shareType) {
    case 0x01:
      return 'DISK'
    case 0x02:
      return 'PIPE'
    case 0x03:
      return 'PRINT'
    default:
      return `Unknown (0x${shareType.toString(16)})`
  }
}
