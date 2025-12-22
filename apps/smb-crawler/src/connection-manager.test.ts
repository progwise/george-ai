/**
 * Unit tests for SMB connection manager
 *
 * Tests verify correct username/domain parsing for various formats
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createConnection } from './connection-manager'

// Mock dependencies
vi.mock('@george-ai/smb2-client', () => ({
  SMB2Client: vi.fn(),
}))

describe('Connection Manager - Username Parsing', () => {
  let SMB2Client: ReturnType<typeof vi.fn>
  let mockConnect: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    // Reset and configure mock for each test
    const module = await import('@george-ai/smb2-client')
    SMB2Client = module.SMB2Client as unknown as ReturnType<typeof vi.fn>
    mockConnect = vi.fn().mockResolvedValue(undefined)

    SMB2Client.mockImplementation(() => ({
      connect: mockConnect,
      disconnect: vi.fn(),
    }))
  })

  it('should parse DOMAIN\\username format (NetBIOS)', async () => {
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
    const result = await createConnection({
      crawlerId: 'test-5',
      uri: '//server/share/path/to/folder',
      username: 'user',
      password: 'test-pass',
    })

    // Verify path is extracted correctly
    expect(result.sharePath).toBe('path/to/folder')
  })

  it('should handle username with backslash precedence (DOMAIN\\user@email)', async () => {
    // When username contains both \ and @, backslash format takes precedence
    await createConnection({
      crawlerId: 'test-6',
      uri: '//server/share',
      username: 'DOMAIN\\user@email',
      password: 'test-pass',
    })

    // Verify backslash parsing takes precedence
    expect(SMB2Client).toHaveBeenCalledWith({
      host: 'server',
      port: 445,
      share: 'share',
      username: 'user@email', // Everything after last backslash
      password: 'test-pass',
      domain: 'DOMAIN', // Everything before last backslash
    })
  })
})
