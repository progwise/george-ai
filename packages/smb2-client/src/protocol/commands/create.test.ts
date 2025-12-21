/**
 * Unit tests for CREATE command
 *
 * Tests verify message structure against SMB2 specification
 */
import { describe, expect, it } from 'vitest'

import { CreateDisposition, DesiredAccess, FileAttributes, SMB2Command, ShareAccess } from '../constants'
import { createCreateRequest } from './create'

describe('CREATE Command', () => {
  it('should create valid CREATE request structure', () => {
    const message = createCreateRequest(
      {
        path: 'test.txt',
        desiredAccess: DesiredAccess.GENERIC_READ,
        fileAttributes: FileAttributes.NORMAL,
        shareAccess: ShareAccess.READ,
        createDisposition: CreateDisposition.OPEN,
        createOptions: 0,
      },
      123n,
      456,
    )

    expect(message.header.command).toBe(SMB2Command.CREATE)
    expect(message.header.sessionId).toBe(123n)
    expect(message.header.treeId).toBe(456)

    // Verify request body structure
    const body = message.body

    // StructureSize (2 bytes): MUST be 57
    const structureSize = body.readUInt16LE(0)
    expect(structureSize).toBe(57)

    // DesiredAccess (4 bytes) at offset 24
    const desiredAccess = body.readUInt32LE(24)
    expect(desiredAccess).toBe(DesiredAccess.GENERIC_READ)

    // FileAttributes (4 bytes) at offset 28
    const fileAttributes = body.readUInt32LE(28)
    expect(fileAttributes).toBe(FileAttributes.NORMAL)

    // ShareAccess (4 bytes) at offset 32
    const shareAccess = body.readUInt32LE(32)
    expect(shareAccess).toBe(ShareAccess.READ)

    // CreateDisposition (4 bytes) at offset 36
    const createDisposition = body.readUInt32LE(36)
    expect(createDisposition).toBe(CreateDisposition.OPEN)

    // CreateOptions (4 bytes) at offset 40
    const createOptions = body.readUInt32LE(40)
    expect(createOptions).toBe(0)

    // NameOffset (2 bytes) at offset 44: 64 (SMB2 header) + 56 (fixed fields) = 120
    const nameOffset = body.readUInt16LE(44)
    expect(nameOffset).toBe(120)

    // NameLength (2 bytes) at offset 46
    const nameLength = body.readUInt16LE(46)
    expect(nameLength).toBeGreaterThan(0)

    // Name (UTF-16LE) - starts at offset 56 (after fixed 56-byte fields)
    const nameBuffer = body.subarray(56)
    const decodedName = nameBuffer.toString('utf16le', 0, nameLength)
    expect(decodedName).toBe('test.txt')
  })
})
