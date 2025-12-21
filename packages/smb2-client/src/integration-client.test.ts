/**
 * Integration test: High-level SMB2Client API
 */
import { describe, expect, it } from 'vitest'

import { SMB2Client } from './client'

// In CI (GitHub Actions), services are accessible via localhost
// In devcontainer, use the service name
const SMB_HOST = process.env.SMB_TEST_HOST || 'gai-smb-test'

const testConfig = {
  host: SMB_HOST,
  port: 445,
  domain: 'WORKGROUP',
  username: 'testuser1',
  password: 'password123',
  share: 'public',
}

describe('SMB2Client Integration', () => {
  it('should auto-connect and list directory contents', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // Auto-connect on first operation
      expect(client.isConnected()).toBe(false)

      // List announcements subdirectory (known to exist from low-level tests)
      const files = await client.readdir('announcements')

      // Client should now be connected
      expect(client.isConnected()).toBe(true)

      // Verify we got files
      expect(files).toBeDefined()
      expect(Array.isArray(files)).toBe(true)

      // Verify file metadata structure
      if (files.length > 0) {
        const firstFile = files[0]
        expect(firstFile).toHaveProperty('name')
        expect(firstFile).toHaveProperty('path')
        expect(firstFile).toHaveProperty('isDirectory')
        expect(firstFile).toHaveProperty('size')
        expect(firstFile).toHaveProperty('createdAt')
        expect(firstFile).toHaveProperty('modifiedAt')
        expect(firstFile).toHaveProperty('attributes')
      }
    } catch (err) {
      assert.fail(`Unexpected error during readdir: ${(err as Error).message}`)
    } finally {
      await client.disconnect()
      expect(client.isConnected()).toBe(false)
    }
  })

  it('should list root directory contents', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // List root directory (empty path or '/')
      const files = await client.readdir('/')

      // Verify we got files
      expect(files).toBeDefined()
      expect(Array.isArray(files)).toBe(true)
      expect(files.length).toBeGreaterThan(0)

      // Should include known directories like 'announcements' and 'policies'
      const dirNames = files.map((f) => f.name)
      expect(dirNames).toContain('announcements')
      expect(dirNames).toContain('policies')
    } finally {
      await client.disconnect()
    }
  })

  it('should read file contents', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // Read entire file
      const content = await client.readFile('public_readme.md')

      // Verify content
      expect(content).toBeDefined()
      expect(Buffer.isBuffer(content)).toBe(true)
      expect(content.length).toBeGreaterThan(0)

      // Verify markdown content
      const text = content.toString('utf8')
      expect(text).toContain('# Sample Markdown in public')
    } finally {
      await client.disconnect()
    }
  })

  it('should read file with offset and length', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // Read first 100 bytes
      const chunk = await client.readFile('public_readme.md', { offset: 0n, length: 100 })

      // Verify chunk
      expect(chunk).toBeDefined()
      expect(Buffer.isBuffer(chunk)).toBe(true)
      expect(chunk.length).toBeLessThanOrEqual(100)
    } finally {
      await client.disconnect()
    }
  })

  it('should create read stream', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      const stream = client.createReadStream('public_readme.md')

      // Collect chunks
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        expect(Buffer.isBuffer(chunk)).toBe(true)
        chunks.push(chunk)
      }

      // Verify we got data
      expect(chunks.length).toBeGreaterThan(0)

      // Combine chunks and verify content
      const content = Buffer.concat(chunks)
      expect(content.length).toBeGreaterThan(0)

      const text = content.toString('utf8')
      expect(text).toContain('# Sample Markdown in public')
    } finally {
      await client.disconnect()
    }
  })

  it('should get file metadata with stat', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      const metadata = await client.stat('public_readme.md')

      // Verify metadata structure
      expect(metadata).toBeDefined()
      expect(metadata.name).toBe('public_readme.md')
      expect(metadata.path).toBe('public_readme.md')
      expect(metadata.isDirectory).toBe(false)
      expect(metadata.size).toBeGreaterThan(0n)
      expect(metadata.createdAt).toBeInstanceOf(Date)
      expect(metadata.modifiedAt).toBeInstanceOf(Date)
      expect(metadata.attributes).toBeGreaterThan(0)
    } finally {
      await client.disconnect()
    }
  })

  it('should handle errors gracefully - file not found', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // Try to read non-existent file
      await expect(client.readFile('nonexistent.txt')).rejects.toThrow()
    } finally {
      await client.disconnect()
    }
  })

  it('should handle errors gracefully - invalid credentials', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: 'invaliduser',
      password: 'wrongpassword',
      share: testConfig.share,
    })

    // Should throw on first operation
    await expect(client.readdir('/')).rejects.toThrow()
  })

  it('should support manual connect', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
      autoConnect: false,
    })

    try {
      // Manual connect
      expect(client.isConnected()).toBe(false)
      await client.connect()
      expect(client.isConnected()).toBe(true)

      // Operations should work
      const files = await client.readdir('announcements')
      expect(files).toBeDefined()
    } finally {
      await client.disconnect()
    }
  })

  it('should handle multiple operations on same connection', async () => {
    const client = new SMB2Client({
      host: testConfig.host,
      port: testConfig.port,
      domain: testConfig.domain,
      username: testConfig.username,
      password: testConfig.password,
      share: testConfig.share,
    })

    try {
      // Multiple operations should reuse connection
      const files1 = await client.readdir('announcements')
      expect(files1).toBeDefined()

      const content = await client.readFile('public_readme.md')
      expect(content.length).toBeGreaterThan(0)

      const metadata = await client.stat('public_readme.md')
      expect(metadata.size).toBeGreaterThan(0n)

      const files2 = await client.readdir('policies')
      expect(files2).toBeDefined()

      // Connection should still be active
      expect(client.isConnected()).toBe(true)
    } finally {
      await client.disconnect()
    }
  })
})
