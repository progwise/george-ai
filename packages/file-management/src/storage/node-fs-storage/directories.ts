import { constants } from 'node:fs'
import { access, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import { GLOBAL_STORAGE_LIMIT, isNodeError } from './commons'

export const ensureRoot = async () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  await mkdir(dir, { recursive: true })
  return dir
}

// Initialize root directory on module load
const rootDir = await ensureRoot()

const getDir = async (dir: string): Promise<string> => {
  try {
    // F_OK checks for the existence of the file/folder
    await access(dir, constants.F_OK)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      console.error(`Directory does not exist: ${dir}`)
      throw err
    } else if (isNodeError(err)) {
      console.error(`Error accessing directory ${dir}: ${err.message}`)
    } else if (err instanceof Error) {
      console.error(`Error accessing directory ${dir}: ${err.message}`)
    } else {
      console.error(`Unknown error accessing directory ${dir}`)
    }
    throw err
  }
  return dir
}

const createDir = async (dir: string): Promise<string> => {
  try {
    await access(dir, constants.F_OK)
    // If access doesn't throw, the directory exists
    throw new Error(`Directory already exists: ${dir}`)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      // Directory does not exist, which is expected
    } else if (isNodeError(err)) {
      console.error(`Error checking existence of directory ${dir}: ${err.message}`)
      throw err
    } else if (err instanceof Error) {
      console.error(`Error checking existence of directory ${dir}: ${err.message}`)
      throw err
    } else {
      console.error(`Unknown error checking of workspace directory ${dir}`)
      throw err
    }
  }
  await mkdir(dir, { recursive: true })
  return dir
}

export const getWorkspaceDir = async (workspaceId: string): Promise<string> => {
  return await getDir(path.join(rootDir, 'workspaces', workspaceId))
}

export const createWorkspaceDir = async (workspaceId: string): Promise<string> => {
  return await createDir(path.join(rootDir, 'workspaces', workspaceId))
}

export const getLibraryDir = async (workspaceId: string, libraryId: string): Promise<string> => {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  return await getDir(path.join(workspaceDir, 'libraries', libraryId))
}

export const createLibraryDir = async (workspaceId: string, libraryId: string): Promise<string> => {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  return await createDir(path.join(workspaceDir, 'libraries', libraryId))
}

export const getFileDir = async (workspaceId: string, libraryId: string, fileId: string): Promise<string> => {
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  return await getDir(path.join(libraryDir, 'files', fileId))
}

export const createFileDir = async (workspaceId: string, libraryId: string, fileId: string): Promise<string> => {
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  return await createDir(path.join(libraryDir, 'files', fileId))
}

export const getExtractionDir = async (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<string> => {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  return await getDir(path.join(fileDir, 'extractions', methodId))
}

export const createExtractionDir = async (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<string> => {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  return await createDir(path.join(fileDir, 'extractions', methodId))
}

export async function getFolderStats(dirPath: string): Promise<{ diskSize: number; fileCount: number }> {
  const entries = await readdir(dirPath, { withFileTypes: true })

  const tasks = entries.map((entry) =>
    GLOBAL_STORAGE_LIMIT(async () => {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Recursive sum
        return await getFolderStats(fullPath)
      }

      if (entry.isFile()) {
        const fileStat = await stat(fullPath)
        return { diskSize: fileStat.size, fileCount: 1 }
      }

      return { diskSize: 0, fileCount: 0 }
    }),
  )

  const results = await Promise.all(tasks)

  // Use a simple loop for the final sum to avoid object allocation overhead in large arrays
  let totalSize = 0
  let totalFiles = 0

  for (const res of results) {
    totalSize += res.diskSize
    totalFiles += res.fileCount
  }

  return { diskSize: totalSize, fileCount: totalFiles }
}
