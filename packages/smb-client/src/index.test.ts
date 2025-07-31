import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { SMBClient, configure, listDirectories, listFiles, readFile, type smbClientOptions } from './index'

// Test configuration for SMB test server
const TEST_SMB_OPTIONS: smbClientOptions = {
  username: 'testuser1',
  password: 'password123',
}

const ADMIN_SMB_OPTIONS: smbClientOptions = {
  username: 'admin',
  password: 'admin123',
}

describe('SMB Client', () => {
  describe('SMBClient class', () => {
    let client: SMBClient

    beforeEach(() => {
      client = new SMBClient(TEST_SMB_OPTIONS)
    })

    describe('URI parsing', () => {
      it('should parse valid SMB URIs', async () => {
        // This tests the internal URI parsing by attempting operations on valid shares only
        const testUris = ['smb://gai-smb-test:10445/public/', 'smb://gai-smb-test:10445/documents/']

        for (const uri of testUris) {
          // Should not throw an error for valid URIs
          const files = await client.listFiles(uri)
          expect(Array.isArray(files)).toBe(true)
        }
      })

      it('should reject invalid SMB URIs', async () => {
        const invalidUris = ['http://example.com', 'ftp://server/file', 'invalid-uri', 'smb://', 'smb://server']

        for (const uri of invalidUris) {
          await expect(client.listFiles(uri)).rejects.toThrow('Invalid SMB URI')
        }
      })
    })

    describe('connection to SMB test server', () => {
      it('should list files in public share', async () => {
        const files = await client.listFiles('smb://gai-smb-test:10445/public/')

        expect(Array.isArray(files)).toBe(true)
        // Public share should contain some test files
        expect(files.length).toBeGreaterThan(0)

        // Check file structure
        files.forEach((file) => {
          expect(file).toHaveProperty('name')
          expect(file).toHaveProperty('size')
          expect(file).toHaveProperty('isDirectory')
          expect(file).toHaveProperty('modifiedTime')
          expect(file.isDirectory).toBe(false)
          expect(typeof file.name).toBe('string')
          expect(typeof file.size).toBe('number')
          expect(file.modifiedTime).toBeInstanceOf(Date)
        })
      })

      it('should list directories in public share', async () => {
        const directories = await client.listDirectories('smb://gai-smb-test:10445/public/')

        expect(Array.isArray(directories)).toBe(true)

        // Check directory structure
        directories.forEach((dir) => {
          expect(dir).toHaveProperty('name')
          expect(dir).toHaveProperty('size')
          expect(dir).toHaveProperty('isDirectory')
          expect(dir).toHaveProperty('modifiedTime')
          expect(dir.isDirectory).toBe(true)
          expect(typeof dir.name).toBe('string')
          expect(dir.modifiedTime).toBeInstanceOf(Date)
        })
      })

      it('should read a text file from public share', async () => {
        // First, find a text file in the public share
        const files = await client.listFiles('smb://gai-smb-test:10445/public/')
        const textFile = files.find(
          (file) => file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv'),
        )

        if (textFile) {
          const content = await client.readFile(`smb://gai-smb-test:10445/public/${textFile.name}`)
          expect(typeof content).toBe('string')
          expect(content.length).toBeGreaterThan(0)
        }
      })

      it('should access documents share with correct permissions', async () => {
        const files = await client.listFiles('smb://gai-smb-test:10445/documents/')

        expect(Array.isArray(files)).toBe(true)
        // Documents share should have files
        expect(files.length).toBeGreaterThan(0)
      })

      it('should handle nested directory structure', async () => {
        // Try to access a nested directory
        const files = await client.listFiles('smb://gai-smb-test:10445/documents/projects/')

        expect(Array.isArray(files)).toBe(true)
      })

      it('should fail with incorrect credentials', async () => {
        const badClient = new SMBClient({
          username: 'wronguser',
          password: 'wrongpass',
        })

        await expect(badClient.listFiles('smb://gai-smb-test:10445/public/')).rejects.toThrow()
      })

      it('should fail when accessing private share without admin permissions', async () => {
        // testuser1 should not have access to private share
        await expect(client.listFiles('smb://gai-smb-test:10445/private/')).rejects.toThrow()
      })

      it('should access private share with admin credentials', async () => {
        const adminClient = new SMBClient(ADMIN_SMB_OPTIONS)

        const files = await adminClient.listFiles('smb://gai-smb-test:10445/private/')
        expect(Array.isArray(files)).toBe(true)
      })
    })
  })

  describe('configured client functions', () => {
    beforeAll(() => {
      configure(TEST_SMB_OPTIONS)
    })

    it('should use configured client for listFiles', async () => {
      const files = await listFiles('smb://gai-smb-test:10445/public/')

      expect(Array.isArray(files)).toBe(true)
      expect(files.length).toBeGreaterThan(0)
    })

    it('should use configured client for listDirectories', async () => {
      const directories = await listDirectories('smb://gai-smb-test:10445/public/')

      expect(Array.isArray(directories)).toBe(true)
    })

    it('should use configured client for readFile', async () => {
      // Find a readable file first
      const files = await listFiles('smb://gai-smb-test:10445/public/')
      const textFile = files.find((file) => file.name.endsWith('.txt') || file.name.endsWith('.md'))

      if (textFile) {
        const content = await readFile(`smb://gai-smb-test:10445/public/${textFile.name}`)
        expect(typeof content).toBe('string')
      }
    })

    it('should allow override with per-call options', async () => {
      // Use admin credentials to access private share
      const files = await listFiles('smb://gai-smb-test:10445/private/', ADMIN_SMB_OPTIONS)

      expect(Array.isArray(files)).toBe(true)
    })

    it('should throw error when not configured and no options provided', async () => {
      // Reset configuration
      configure({ username: '', password: '' })

      await expect(listFiles('smb://gai-smb-test:10445/public/')).rejects.toThrow('SMB client not configured')
      await expect(readFile('smb://gai-smb-test:10445/public/test.txt')).rejects.toThrow('SMB client not configured')
      await expect(listDirectories('smb://gai-smb-test:10445/public/')).rejects.toThrow('SMB client not configured')
    })
  })

  describe('error handling', () => {
    let client: SMBClient

    beforeEach(() => {
      client = new SMBClient(TEST_SMB_OPTIONS)
    })

    it('should handle non-existent share', async () => {
      await expect(client.listFiles('smb://gai-smb-test:10445/nonexistent/')).rejects.toThrow()
    })

    it('should handle non-existent file', async () => {
      await expect(client.readFile('smb://gai-smb-test:10445/public/nonexistent.txt')).rejects.toThrow()
    })

    it('should handle connection timeout to non-existent server', async () => {
      const badClient = new SMBClient({
        username: 'test',
        password: 'test',
      })

      await expect(badClient.listFiles('smb://nonexistent.server:12345/share/')).rejects.toThrow()
    })
  })

  describe('different file types and shares', () => {
    let client: SMBClient

    beforeAll(() => {
      client = new SMBClient(TEST_SMB_OPTIONS)
    })

    it('should handle various file types in documents share', async () => {
      const files = await client.listFiles('smb://gai-smb-test:10445/documents/')

      // Should contain different file types
      const fileTypes = files.map((file) => file.name.split('.').pop()?.toLowerCase()).filter(Boolean)
      const uniqueTypes = [...new Set(fileTypes)]

      expect(uniqueTypes.length).toBeGreaterThan(1) // Should have multiple file types
    })

    it('should list engineering share contents', async () => {
      const files = await client.listFiles('smb://gai-smb-test:10445/engineering/')
      const directories = await client.listDirectories('smb://gai-smb-test:10445/engineering/')

      expect(Array.isArray(files)).toBe(true)
      expect(Array.isArray(directories)).toBe(true)
    })

    it('should list marketing share contents', async () => {
      const files = await client.listFiles('smb://gai-smb-test:10445/marketing/')
      const directories = await client.listDirectories('smb://gai-smb-test:10445/marketing/')

      expect(Array.isArray(files)).toBe(true)
      expect(Array.isArray(directories)).toBe(true)
    })
  })
})
