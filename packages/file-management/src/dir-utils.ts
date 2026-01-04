import fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import path from 'node:path'

interface FileStats {
  name: string
  mtime: number // Modification time in milliseconds
}

export const getUploadsDir = () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const getLibraryDir = (libraryId: string) => {
  const uploadsDir = getUploadsDir()
  const libraryDir = `${uploadsDir}/${libraryId}`
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true })
  }
  return libraryDir
}

export async function getMostRecentFile(baseDir: string): Promise<string | undefined> {
  try {
    // 1. Read all entries (files and directories) in the directory
    const entries = await fsp.readdir(baseDir)
    if (entries.length === 0) {
      return undefined
    }

    // Create an array of Promises for getting stats for each entry
    const statsPromises = entries.map(async (entry): Promise<FileStats | null> => {
      const fullPath = path.join(baseDir, entry)
      const stats = await fsp.stat(fullPath)

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
export const getFileDir = ({
  fileId,
  libraryId,
  errorIfNotExists = false,
}: {
  fileId: string
  libraryId: string
  errorIfNotExists?: boolean
}) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  if (fs.existsSync(fileDir)) {
    return fileDir
  } else if (errorIfNotExists) {
    throw new Error('Directory does not exist')
  }
  fs.mkdirSync(fileDir, { recursive: true })
  return fileDir
}

export const fileDirExists = (fileId: string, libraryId: string) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  return fs.existsSync(fileDir)
}

export const fileDirIsEmpty = async (fileId: string, libraryId: string) => {
  if (!fileDirExists(fileId, libraryId)) {
    return true
  }
  const fileDir = getFileDir({ fileId, libraryId })
  const files = await fs.promises.readdir(fileDir)
  return files.length === 0
}
