/**
 * Unit tests for SMB file crawler
 *
 * Tests verify correct path handling and file discovery
 */
import { describe, expect, it, vi } from 'vitest'

import type { SMB2Client } from '@george-ai/smb2-client'
import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

import { crawlDirectory } from './file-crawler'

/**
 * Regression test for path duplication bug
 *
 * Issue: When basePath contained subdirectories (e.g., "000_Quality Assurance/04_Team Maintenance"),
 * the crawler would extract the path from URI again and join it with basePath,
 * resulting in duplicated paths like:
 * "000_Quality Assurance/04_Team Maintenance/000_Quality Assurance/04_Team Maintenance"
 *
 * This test verifies the fix: the crawler should use basePath as-is without re-extracting from URI.
 */
describe('File Crawler - Path Handling', () => {
  it('should not duplicate path when basePath contains subdirectories', async () => {
    // Setup: Track which paths readdir is called with
    const readdirCalls: string[] = []

    // Mock SMB2Client
    const mockClient = {
      readdir: vi.fn(async (path: string) => {
        readdirCalls.push(path)
        // Return empty directory (no files)
        return []
      }),
    } as unknown as SMB2Client

    // Setup: Crawler options with full URI including subdirectories
    const options: SmbCrawlOptions = {
      uri: '//Data.CHEPLA-ZH.local/QK-QS/000_Quality Assurance/04_Team Maintenance/05_Order_BANF_PO_QA-Maintenance',
      username: 'test-user',
      password: 'test-pass',
    }

    // Setup: basePath is the extracted subdirectory path (from connection-manager)
    const basePath = '000_Quality Assurance/04_Team Maintenance/05_Order_BANF_PO_QA-Maintenance'

    // Execute: Crawl the directory
    const files: unknown[] = []
    for await (const file of crawlDirectory(mockClient, basePath, options)) {
      files.push(file)
    }

    // Verify: readdir should be called with the CORRECT path (not duplicated)
    expect(readdirCalls).toHaveLength(1)
    expect(readdirCalls[0]).toBe('000_Quality Assurance/04_Team Maintenance/05_Order_BANF_PO_QA-Maintenance')

    // Verify: readdir should NOT be called with the duplicated path (old buggy behavior)
    const duplicatedPath =
      '000_Quality Assurance/04_Team Maintenance/05_Order_BANF_PO_QA-Maintenance/000_Quality Assurance/04_Team Maintenance/05_Order_BANF_PO_QA-Maintenance'
    expect(readdirCalls[0]).not.toBe(duplicatedPath)
  })

  it('should use root path when basePath is empty', async () => {
    const readdirCalls: string[] = []

    const mockClient = {
      readdir: vi.fn(async (path: string) => {
        readdirCalls.push(path)
        return []
      }),
    } as unknown as SMB2Client

    const options: SmbCrawlOptions = {
      uri: '//Data.CHEPLA-ZH.local/QK-QS',
      username: 'test-user',
      password: 'test-pass',
    }

    // Empty basePath means we're at the share root
    const basePath = ''

    const files: unknown[] = []
    for await (const file of crawlDirectory(mockClient, basePath, options)) {
      files.push(file)
    }

    // Should use '/' as the root path
    expect(readdirCalls).toHaveLength(1)
    expect(readdirCalls[0]).toBe('/')
  })

  it('should handle spaces in directory paths correctly', async () => {
    const readdirCalls: string[] = []

    const mockClient = {
      readdir: vi.fn(async (path: string) => {
        readdirCalls.push(path)
        return []
      }),
    } as unknown as SMB2Client

    const options: SmbCrawlOptions = {
      uri: '//Data.CHEPLA-ZH.local/QK-QS/000_Quality Assurance',
      username: 'test-user',
      password: 'test-pass',
    }

    const basePath = '000_Quality Assurance'

    const files: unknown[] = []
    for await (const file of crawlDirectory(mockClient, basePath, options)) {
      files.push(file)
    }

    // Spaces should be preserved as-is
    expect(readdirCalls[0]).toBe('000_Quality Assurance')
  })
})
