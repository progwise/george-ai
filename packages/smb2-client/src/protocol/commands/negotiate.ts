/**
 * SMB2 NEGOTIATE Command
 *
 * The NEGOTIATE command is used to negotiate the SMB2 dialect version
 * and capabilities between client and server.
 *
 * Reference:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e14db7ff-763a-4263-8b10-0c3944f52fc5
 */
import { randomBytes } from 'node:crypto'

import { SMB2Capabilities, SMB2Command, SMB2Dialect, SMB2SecurityMode } from '../constants'
import { SMB2Message } from '../message'
import type { NegotiateResponse } from '../types'

/**
 * Create NEGOTIATE request message
 *
 * @param dialects - SMB2 dialects to negotiate (defaults to 2.0.2, 2.1, 3.0, 3.0.2, 3.1.1)
 * @returns SMB2 NEGOTIATE request message
 */
export function createNegotiateRequest(dialects?: SMB2Dialect[]): SMB2Message {
  // Default: negotiate SMB 2.x and 3.x dialects (highest to lowest)
  // Note: SMB 3.1.1 requires negotiate contexts which we don't support yet
  const dialectsToNegotiate = dialects ?? [
    SMB2Dialect.SMB_3_0_2,
    SMB2Dialect.SMB_3_0,
    SMB2Dialect.SMB_2_1,
    SMB2Dialect.SMB_2_0_2,
  ]

  const dialectCount = dialectsToNegotiate.length
  const clientGuid = randomBytes(16)

  // Calculate total size
  const structureSize = 36
  const dialectsSize = dialectCount * 2 // 2 bytes per dialect
  const totalSize = structureSize + dialectsSize

  const body = Buffer.alloc(totalSize)
  let offset = 0

  // StructureSize (2 bytes): MUST be 36
  body.writeUInt16LE(structureSize, offset)
  offset += 2

  // DialectCount (2 bytes)
  body.writeUInt16LE(dialectCount, offset)
  offset += 2

  // SecurityMode (2 bytes)
  const securityMode = SMB2SecurityMode.SIGNING_ENABLED
  body.writeUInt16LE(securityMode, offset)
  offset += 2

  // Reserved (2 bytes)
  body.writeUInt16LE(0, offset)
  offset += 2

  // Capabilities (4 bytes) - 0 for SMB 2.0.2/2.1
  body.writeUInt32LE(0, offset)
  offset += 4

  // ClientGuid (16 bytes)
  clientGuid.copy(body, offset)
  offset += 16

  // NegotiateContextOffset/ClientStartTime (8 bytes)
  // For SMB 2.0.2/2.1/3.0/3.0.2: ClientStartTime (MUST be 0)
  // For SMB 3.1.1: NegotiateContextOffset + NegotiateContextCount + Reserved2
  body.writeBigUInt64LE(0n, offset)
  offset += 8

  // Dialects array (variable)
  for (const dialect of dialectsToNegotiate) {
    body.writeUInt16LE(dialect, offset)
    offset += 2
  }

  // Create message
  return SMB2Message.createRequest(SMB2Command.NEGOTIATE, body)
}

/**
 * Parse NEGOTIATE response message
 *
 * @param message - SMB2 NEGOTIATE response message
 * @returns Parsed NEGOTIATE response
 */
export function parseNegotiateResponse(message: SMB2Message): NegotiateResponse {
  if (!message.isResponse()) {
    throw new Error('Expected NEGOTIATE response')
  }

  if (message.header.command !== SMB2Command.NEGOTIATE) {
    throw new Error(`Expected NEGOTIATE response, got command ${message.header.command}`)
  }

  if (!message.isSuccess()) {
    throw new Error(`NEGOTIATE failed with status: ${message.getStatusString()}`)
  }

  const body = message.body
  let offset = 0

  // StructureSize (2 bytes): MUST be 65
  const structureSize = body.readUInt16LE(offset)
  offset += 2

  if (structureSize !== 65) {
    throw new Error(`Invalid NEGOTIATE response structure size: ${structureSize} (expected 65)`)
  }

  // SecurityMode (2 bytes)
  const securityMode = body.readUInt16LE(offset)
  offset += 2

  // DialectRevision (2 bytes)
  const dialectRevision = body.readUInt16LE(offset) as SMB2Dialect
  offset += 2

  // NegotiateContextCount/Reserved (2 bytes)
  const negotiateContextCount = dialectRevision === SMB2Dialect.SMB_3_1_1 ? body.readUInt16LE(offset) : 0
  offset += 2

  // ServerGuid (16 bytes)
  const serverGuid = Buffer.from(body.subarray(offset, offset + 16))
  offset += 16

  // Capabilities (4 bytes)
  const capabilities = body.readUInt32LE(offset)
  offset += 4

  // MaxTransactSize (4 bytes)
  const maxTransactSize = body.readUInt32LE(offset)
  offset += 4

  // MaxReadSize (4 bytes)
  const maxReadSize = body.readUInt32LE(offset)
  offset += 4

  // MaxWriteSize (4 bytes)
  const maxWriteSize = body.readUInt32LE(offset)
  offset += 4

  // SystemTime (8 bytes)
  const systemTime = body.readBigUInt64LE(offset)
  offset += 8

  // ServerStartTime (8 bytes)
  const serverStartTime = body.readBigUInt64LE(offset)
  offset += 8

  // SecurityBufferOffset (2 bytes)
  const securityBufferOffset = body.readUInt16LE(offset)
  offset += 2

  // SecurityBufferLength (2 bytes)
  const securityBufferLength = body.readUInt16LE(offset)
  offset += 2

  // NegotiateContextOffset/Reserved2 (4 bytes)
  const negotiateContextOffset = dialectRevision === SMB2Dialect.SMB_3_1_1 ? body.readUInt32LE(offset) : 0
  offset += 4

  // SecurityBuffer (variable)
  let securityBuffer = Buffer.alloc(0)
  if (securityBufferLength > 0 && securityBufferOffset > 0) {
    // Offset is from start of SMB2 header, so we need to adjust for body start
    const bufferStart = securityBufferOffset - 64 // SMB2 header size
    securityBuffer = Buffer.from(body.subarray(bufferStart, bufferStart + securityBufferLength))
  }

  return {
    structureSize,
    securityMode,
    dialectRevision,
    negotiateContextCount: dialectRevision === SMB2Dialect.SMB_3_1_1 ? negotiateContextCount : undefined,
    serverGuid,
    capabilities,
    maxTransactSize,
    maxReadSize,
    maxWriteSize,
    systemTime,
    serverStartTime,
    securityBufferOffset,
    securityBufferLength,
    negotiateContextOffset: dialectRevision === SMB2Dialect.SMB_3_1_1 ? negotiateContextOffset : undefined,
    securityBuffer,
  }
}

/**
 * Check if dialect supports a capability
 */
export function hasCapability(capabilities: number, capability: SMB2Capabilities): boolean {
  return (capabilities & capability) !== 0
}

/**
 * Get dialect name
 */
export function getDialectName(dialect: SMB2Dialect): string {
  switch (dialect) {
    case SMB2Dialect.SMB_2_0_2:
      return 'SMB 2.0.2'
    case SMB2Dialect.SMB_2_1:
      return 'SMB 2.1'
    case SMB2Dialect.SMB_3_0:
      return 'SMB 3.0'
    case SMB2Dialect.SMB_3_0_2:
      return 'SMB 3.0.2'
    case SMB2Dialect.SMB_3_1_1:
      return 'SMB 3.1.1'
    default:
      return `Unknown (0x${(dialect as number).toString(16)})`
  }
}
