/**
 * Unit tests for SMB connection manager
 *
 * Tests verify correct username/domain parsing for various formats
 */
import { describe, expect, it, vi } from 'vitest'

import { createConnection } from './connection-manager'

// Mock dependencies
vi.mock('@george-ai/smb2-client', () => ({
  SMB2Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  })),
}))

describe('Connection Manager - Username Parsing', () => {
  it('should parse DOMAIN\\username format (NetBIOS)', async () => {
    const { SMB2Client } = await import('@george-ai/smb2-client')
    const mockConnect = vi.fn().mockResolvedValue(undefined)
    ;(SMB2Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))

    await createConnection({
      crawlerId: 'test-1',
      uri: '//server/share',
      username: 'CHEPLA-ZH\\s-crawler-georgeai',
      password: 'test-pass',
    })

    // Verify SMB2Client was created with correct parsed values
    expect(SMB2Client).toHaveBeenCalledWith({
      host: 'server',
      port: 445,
      share: 'share',
      username: 's-crawler-georgeai', // Username without domain
      password: 'test-pass',
      domain: 'CHEPLA-ZH', // Domain extracted
    })
  })

  it('should parse username@domain.com format (UPN)', async () => {
    const { SMB2Client } = await import('@george-ai/smb2-client')
    const mockConnect = vi.fn().mockResolvedValue(undefined)
    ;(SMB2Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))

    await createConnection({
      crawlerId: 'test-2',
      uri: '//server/share',
      username: 's-crawler-georgeai@chepla-zh.local',
      password: 'test-pass',
    })

    // Verify SMB2Client was created with correct parsed values
    expect(SMB2Client).toHaveBeenCalledWith({
      host: 'server',
      port: 445,
      share: 'share',
      username: 's-crawler-georgeai', // Username without domain
      password: 'test-pass',
      domain: 'chepla-zh.local', // Domain extracted from UPN
    })
  })

  it('should use WORKGROUP for plain username', async () => {
    const { SMB2Client } = await import('@george-ai/smb2-client')
    const mockConnect = vi.fn().mockResolvedValue(undefined)
    ;(SMB2Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))

    await createConnection({
      crawlerId: 'test-3',
      uri: '//server/share',
      username: 'administrator',
      password: 'test-pass',
    })

    // Verify SMB2Client was created with WORKGROUP as default
    expect(SMB2Client).toHaveBeenCalledWith({
      host: 'server',
      port: 445,
      share: 'share',
      username: 'administrator', // Username stays as-is
      password: 'test-pass',
      domain: 'WORKGROUP', // Default domain
    })
  })

  it('should handle custom port in URI', async () => {
    const { SMB2Client } = await import('@george-ai/smb2-client')
    const mockConnect = vi.fn().mockResolvedValue(undefined)
    ;(SMB2Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))

    await createConnection({
      crawlerId: 'test-4',
      uri: '//server:1445/share',
      username: 'user',
      password: 'test-pass',
    })

    // Verify custom port is parsed
    expect(SMB2Client).toHaveBeenCalledWith({
      host: 'server',
      port: 1445, // Custom port
      share: 'share',
      username: 'user',
      password: 'test-pass',
      domain: 'WORKGROUP',
    })
  })

  it('should handle paths in URI', async () => {
    const { SMB2Client } = await import('@george-ai/smb2-client')
    const mockConnect = vi.fn().mockResolvedValue(undefined)
    ;(SMB2Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))

    const result = await createConnection({
      crawlerId: 'test-5',
      uri: '//server/share/path/to/folder',
      username: 'user',
      password: 'test-pass',
    })

    // Verify path is extracted correctly
    expect(result.sharePath).toBe('path/to/folder')
  })
})
