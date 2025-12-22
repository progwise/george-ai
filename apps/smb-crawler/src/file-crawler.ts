/**
 * File Crawler
 *
 * Walks SMB shares using SMB2Client and discovers files matching criteria
 */
import { lookup } from 'mime-types'
import { minimatch } from 'minimatch'
import crypto from 'node:crypto'
import path from 'node:path'

import type { SMB2Client } from '@george-ai/smb2-client'
import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

import type { DiscoveredFile } from './types'

interface CrawlStats {
  filesFound: number
  filesMatched: number
  totalBytes: number
  currentDirectory: string
}

/**
 * Calculate SHA-256 hash of a file using SMB2 stream
 */
async function calculateFileHash(client: SMB2Client, filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = client.createReadStream(filePath)

    stream.on('data', (chunk: Buffer) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

/**
 * Check if a filename matches any of the patterns
 */
function matchesPatterns(filename: string, patterns?: string[]): boolean {
  if (!patterns || patterns.length === 0) {
    return true
  }

  return patterns.some((pattern) => {
    // Use minimatch for proper glob pattern support (including ** for recursive matching)
    return minimatch(filename, pattern, { nocase: true })
  })
}

/**
 * Recursively walk directory tree using SMB2Client and discover files
 */
export async function* crawlDirectory(
  client: SMB2Client,
  basePath: string,
  options: SmbCrawlOptions,
  onProgress?: (stats: CrawlStats) => void,
): AsyncGenerator<DiscoveredFile, void, unknown> {
  const stats: CrawlStats = {
    filesFound: 0,
    filesMatched: 0,
    totalBytes: 0,
    currentDirectory: '',
  }

  // Use basePath as-is (already extracted by connection-manager)
  // Use '/' as default if basePath is empty (root of share)
  const startPath = basePath || '/'

  async function* walk(dirPath: string): AsyncGenerator<DiscoveredFile, void, unknown> {
    stats.currentDirectory = dirPath

    let entries: Array<{ name: string; isDirectory: boolean }>
    try {
      entries = await client.readdir(dirPath)
    } catch (error) {
      console.warn(`[Crawler] Cannot read directory ${dirPath}:`, error)
      return
    }

    for (const entry of entries) {
      const fullPath = path.posix.join(dirPath, entry.name)

      if (entry.isDirectory) {
        // Recursively walk subdirectories
        yield* walk(fullPath)
      } else {
        stats.filesFound++

        // Check include patterns
        if (!matchesPatterns(entry.name, options.includePatterns)) {
          continue
        }

        // Check exclude patterns (only if defined)
        if (options.excludePatterns && matchesPatterns(entry.name, options.excludePatterns)) {
          continue
        }

        // Get file stats
        let fileStat: { size: number; modifiedAt: Date }
        try {
          fileStat = await client.stat(fullPath)
        } catch (error) {
          console.warn(`[Crawler] Cannot stat file ${fullPath}:`, error)
          continue
        }

        // Convert size to number for comparison and stats
        const fileSize = Number(fileStat.size)

        // Check file size
        if (options.maxFileSizeBytes && fileSize > options.maxFileSizeBytes) {
          console.log(`[Crawler] Skipping large file ${fullPath}: ${fileSize} bytes`)
          continue
        }

        stats.filesMatched++
        stats.totalBytes += fileSize

        // Calculate file hash
        let fileHash: string
        try {
          fileHash = await calculateFileHash(client, fullPath)
        } catch (error) {
          console.warn(`[Crawler] Failed to calculate hash for ${fullPath}:`, error)
          continue
        }

        // Generate file metadata
        const relativePath = path.posix.relative(startPath, fullPath)
        const fileId = Buffer.from(relativePath).toString('base64url')
        const mimeType = lookup(entry.name) || undefined

        const file: DiscoveredFile = {
          fileId,
          name: entry.name,
          relativePath,
          absolutePath: fullPath, // This is now the SMB path, not a filesystem path
          size: fileStat.size,
          mimeType,
          lastModified: fileStat.modifiedAt,
          hash: fileHash,
        }

        yield file

        // Report progress every 10 files
        if (stats.filesMatched % 10 === 0 && onProgress) {
          onProgress({
            filesFound: stats.filesFound,
            filesMatched: stats.filesMatched,
            totalBytes: stats.totalBytes,
            currentDirectory: stats.currentDirectory,
          })
        }
      }
    }
  }

  yield* walk(startPath)

  // Final progress report
  if (onProgress) {
    onProgress({
      filesFound: stats.filesFound,
      filesMatched: stats.filesMatched,
      totalBytes: stats.totalBytes,
      currentDirectory: '',
    })
  }
}
