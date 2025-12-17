/**
 * File Crawler
 *
 * Walks mounted SMB shares and discovers files matching criteria
 */
import { lookup } from 'mime-types'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

import type { DiscoveredFile } from './types'

interface CrawlStats {
  filesFound: number
  filesMatched: number
  totalBytes: number
  currentDirectory: string
}

/**
 * Calculate SHA-256 hash of a file
 */
async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('data', (chunk) => hash.update(chunk))
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
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')

    const regex = new RegExp(`^${regexPattern}$`, 'i')
    return regex.test(filename)
  })
}

/**
 * Recursively walk directory tree and discover files
 */
export async function* crawlDirectory(
  mountPoint: string,
  options: SmbCrawlOptions,
  onProgress?: (stats: CrawlStats) => void,
): AsyncGenerator<DiscoveredFile, void, unknown> {
  const stats: CrawlStats = {
    filesFound: 0,
    filesMatched: 0,
    totalBytes: 0,
    currentDirectory: '',
  }

  // Parse the URI to get the subpath if any
  const uriMatch = options.uri.match(/^(?:smb:)?\/\/[^/]+\/[^/]+(?:\/(.*))?$/)
  const subPath = uriMatch?.[1] || ''
  const startPath = subPath ? path.join(mountPoint, subPath) : mountPoint

  // Ensure start path exists
  try {
    await fs.promises.access(startPath)
  } catch {
    throw new Error(`Start path does not exist: ${startPath}`)
  }

  async function* walk(dirPath: string): AsyncGenerator<DiscoveredFile, void, unknown> {
    stats.currentDirectory = dirPath

    let entries: fs.Dirent[]
    try {
      entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    } catch (error) {
      console.warn(`[Crawler] Cannot read directory ${dirPath}:`, error)
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Recursively walk subdirectories
        yield* walk(fullPath)
      } else if (entry.isFile()) {
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
        let fileStat: fs.Stats
        try {
          fileStat = await fs.promises.stat(fullPath)
        } catch (error) {
          console.warn(`[Crawler] Cannot stat file ${fullPath}:`, error)
          continue
        }

        // Check file size
        if (options.maxFileSizeBytes && fileStat.size > options.maxFileSizeBytes) {
          console.log(`[Crawler] Skipping large file ${fullPath}: ${fileStat.size} bytes`)
          continue
        }

        stats.filesMatched++
        stats.totalBytes += fileStat.size

        // Calculate file hash
        let fileHash: string
        try {
          fileHash = await calculateFileHash(fullPath)
        } catch (error) {
          console.warn(`[Crawler] Failed to calculate hash for ${fullPath}:`, error)
          continue
        }

        // Generate file metadata
        const relativePath = path.relative(mountPoint, fullPath)
        const fileId = Buffer.from(relativePath).toString('base64url')
        const mimeType = lookup(entry.name) || undefined

        const file: DiscoveredFile = {
          fileId,
          name: entry.name,
          relativePath,
          absolutePath: fullPath,
          size: fileStat.size,
          mimeType,
          lastModified: fileStat.mtime,
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
