import { createHash } from 'crypto'
import { createReadStream, promises as fs } from 'fs'
import path from 'path'

interface FileStats {
  name: string
  mtime: number // Modification time in milliseconds
}

/**
 * Finds the name of the most recently modified file in a directory.
 * @param baseDir The directory to search.
 * @returns The name of the most recently modified file, or undefined if the directory is empty.
 */
export async function getMostRecentFile(baseDir: string): Promise<string | undefined> {
  try {
    // 1. Read all entries (files and directories) in the directory
    const entries = await fs.readdir(baseDir)

    if (entries.length === 0) {
      return undefined
    }

    // Create an array of Promises for getting stats for each entry
    const statsPromises = entries.map(async (entry): Promise<FileStats | null> => {
      const fullPath = path.join(baseDir, entry)
      const stats = await fs.stat(fullPath)

      // Only consider actual files (skip directories, symlinks, etc.)
      if (stats.isFile()) {
        return {
          name: entry,
          mtime: stats.mtimeMs, // Use mtimeMs for millisecond precision
        }
      }
      return null
    })

    // 2. Wait for all stats promises to resolve and filter out non-files/errors
    const fileStats = (await Promise.all(statsPromises)).filter((stats): stats is FileStats => stats !== null)

    if (fileStats.length === 0) {
      return undefined
    }

    // 3. Sort by modification time in descending order (most recent first)
    fileStats.sort((a, b) => b.mtime - a.mtime)

    // 4. Return the name of the top file
    return fileStats[0].name
  } catch (error) {
    console.error(`Error reading directory ${baseDir}:`, error)
    throw error
  }
}

/**
 * Calculate SHA256 hash of a file
 * Used to detect if file has changed and resume processing is safe
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

export async function getFileCreationDate(filePath: string): Promise<Date> {
  const fullPath = path.resolve(filePath)

  try {
    const stats = await fs.stat(fullPath)

    // --- Prioritize Birth Time (most accurate "creation" date) ---
    // Check if birthtime is a valid date (not the Unix epoch placeholder).
    // On some systems, Node.js returns a birthtime of 0 if it's not supported.
    const minimumValidTimestamp = new Date('2000-01-01').getTime()

    if (stats.birthtimeMs > minimumValidTimestamp) {
      console.log(`Using birthtime (${stats.birthtimeMs}) as the creation date.`)
      return stats.birthtime
    }

    // --- Fallback: Use Modification Time ---
    // If birthtime is unreliable (less than year 2000),
    // mtime is the next best proxy for the creation time if the file
    // has not been modified since creation.
    console.log(`Birthtime unreliable or unsupported. Falling back to mtime.`)
    return stats.mtime
  } catch (error) {
    throw new Error(`Failed to read file stats for ${filePath}: ${error}`)
  }
}
