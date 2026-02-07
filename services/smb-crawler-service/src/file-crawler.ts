import { lookup } from 'mime-types'
import path from 'node:path'

import { matchGlobPatterns } from '@george-ai/app-commons'
import type { SMB2Client } from '@george-ai/smb2-client'

import { logger } from './common'
import type { DiscoveredFile } from './types'

interface CrawlStats {
  filesFound: number
  filesMatched: number
  totalBytes: number
  currentDirectory: string
}

/**
 * Recursively walk directory tree using SMB2Client and discover files
 */
export async function* crawlDirectory(
  client: SMB2Client,
  options: {
    basePath: string
    jobId: string
    maxFileSizeBytes?: number
    includePatterns?: string[]
    excludePatterns?: string[]
  },
  onProgress?: (stats: CrawlStats) => void,
): AsyncGenerator<DiscoveredFile, void, unknown> {
  const { basePath, jobId } = options
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

    logger.debug('Crawling directory', { basePath, stats, options })

    let entries: Array<{ name: string; isDirectory: boolean }>
    try {
      entries = await client.readdir(dirPath)
    } catch (error) {
      logger.error('Cannot read directory', { basePath, stats, options, error })
      return
    }

    for (const entry of entries) {
      const fullPath = path.posix.join(dirPath, entry.name)

      logger.debug('Processing entry', { fullPath, isDirectory: entry.isDirectory, stats, options })

      if (entry.isDirectory) {
        // Recursively walk subdirectories
        yield* walk(fullPath)
      } else {
        stats.filesFound++

        logger.debug('Found file', { fullPath, stats, entry, options })

        // Check include patterns
        if (!matchGlobPatterns(entry.name, options.includePatterns)) {
          logger.debug('Skipping file (no include match)', { fullPath, stats, entry, options })
          continue
        }

        // Check exclude patterns (only if defined)
        if (options.excludePatterns && matchGlobPatterns(entry.name, options.excludePatterns)) {
          logger.debug('Skipping file (exclude match)', { fullPath, stats, entry, options })
          continue
        }

        // Get file stats
        let fileStat: { size: number; modifiedAt: Date }
        try {
          fileStat = await client.stat(fullPath)
        } catch (error) {
          logger.error('Cannot stat file', { fullPath, error, stats, options })
          continue
        }

        // Convert size to number for comparison and stats
        const fileSize = Number(fileStat.size)

        // Check file size
        if (options.maxFileSizeBytes && fileSize > options.maxFileSizeBytes) {
          logger.debug('Skipping large file', { fullPath, fileSize, stats, options })
          continue
        }

        stats.filesMatched++
        stats.totalBytes += fileSize

        // Generate file metadata
        const relativePath = path.posix.relative(startPath, fullPath)
        const fileId = Buffer.from(relativePath).toString('base64url')
        const mimeType = lookup(entry.name) || undefined

        const file: DiscoveredFile = {
          fileId,
          name: entry.name,
          relativePath,
          absolutePath: fullPath, // This is now the SMB path, not a filesystem path
          size: fileSize,
          mimeType,
          lastModified: fileStat.modifiedAt,
          downloadUrl: `/files/${jobId}/${fileId}`,
        }

        logger.debug('Discovered file metadata', { fullPath, file, stats, options })

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
