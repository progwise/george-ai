/**
 * Unit tests for TREE_CONNECT command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { SMB2Command } from '../constants'
import { createTreeConnectRequest } from './tree-connect'

describe('TREE_CONNECT Command', () => {
  it('should create valid TREE_CONNECT request structure', () => {
    const sharePath = '\\\\server\\share'
    const sessionId = 123n
    const message = createTreeConnectRequest(sharePath, sessionId)

    expect(message.header.command).toBe(SMB2Command.TREE_CONNECT)
    expect(message.header.sessionId).toBe(sessionId)

    // Verify request body structure
    const body = message.body

    // StructureSize (2 bytes): MUST be 9
    const structureSize = body.readUInt16LE(0)
    expect(structureSize).toBe(9)

    // Flags (2 bytes)
    const flags = body.readUInt16LE(2)
    expect(flags).toBe(0)

    // PathOffset (2 bytes): 64 (SMB2 header) + 8 (TREE_CONNECT header) = 72
    const pathOffset = body.readUInt16LE(4)
    expect(pathOffset).toBe(72)

    // PathLength (2 bytes)
    const pathLength = body.readUInt16LE(6)
    expect(pathLength).toBeGreaterThan(0)

    // Path (UTF-16LE)
    const pathBuffer = body.subarray(8, 8 + pathLength)
    const decodedPath = pathBuffer.toString('utf16le')
    expect(decodedPath).toBe(sharePath)
  })
})
