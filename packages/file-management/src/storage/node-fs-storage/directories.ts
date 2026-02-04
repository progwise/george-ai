import { constants } from 'node:fs'
import { access, lstat, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

import {
  EXTRACTIONS_DIR_NAME,
  FILES_DIR_NAME,
  GLOBAL_STORAGE_LIMIT,
  LIBRARIES_DIR_NAME,
  ROOT_DIR,
  WORKSPACES_DIR_NAME,
  isNodeError,
  logger,
} from './commons'

export const ensureRoot = async () => {
  await mkdir(path.join(ROOT_DIR, WORKSPACES_DIR_NAME), { recursive: true })
  return ROOT_DIR
}

// Initialize root directory on module load
const rootDir = await ensureRoot()

const getDir = async (dir: string): Promise<string> => {
  try {
    // F_OK checks for the existence of the file/folder
    await access(dir, constants.F_OK)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      logger.error(`Directory does not exist: ${dir}`)
      throw err
    } else if (isNodeError(err)) {
      logger.error(`Error accessing directory ${dir}: ${err.message}`)
    } else if (err instanceof Error) {
      logger.error(`Error accessing directory ${dir}: ${err.message}`)
    } else {
      logger.error(`Unknown error accessing directory ${dir}`)
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
      logger.error(`Error checking existence of directory ${dir}: ${err.message}`)
      throw err
    } else if (err instanceof Error) {
      logger.error(`Error checking existence of directory ${dir}: ${err.message}`)
      throw err
    } else {
      logger.error(`Unknown error checking of workspace directory ${dir}`)
      throw err
    }
  }
  await mkdir(dir, { recursive: true })
  logger.debug('Created director', { dir })
  return dir
}

export const getWorkspaceDir = async (workspaceId: string): Promise<string> => {
  return await getDir(path.join(rootDir, WORKSPACES_DIR_NAME, workspaceId))
}

export const createWorkspaceDir = async (workspaceId: string): Promise<string> => {
  await createDir(path.join(rootDir, WORKSPACES_DIR_NAME, workspaceId))
  return getWorkspaceDir(workspaceId)
}

export const getLibraryDir = async (workspaceId: string, libraryId: string): Promise<string> => {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  return await getDir(path.join(workspaceDir, LIBRARIES_DIR_NAME, libraryId))
}

export const createLibraryDir = async (workspaceId: string, libraryId: string): Promise<string> => {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  await createDir(path.join(workspaceDir, LIBRARIES_DIR_NAME, libraryId, FILES_DIR_NAME))
  return getLibraryDir(workspaceId, libraryId)
}

export const getFilesDir = async (workspaceId: string, libraryId: string): Promise<string> => {
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  return await getDir(path.join(libraryDir, FILES_DIR_NAME))
}

export const getFileDir = async (workspaceId: string, libraryId: string, fileId: string): Promise<string> => {
  const filesDir = await getFilesDir(workspaceId, libraryId)
  return await getDir(path.join(filesDir, fileId))
}

export const createFileDir = async (workspaceId: string, libraryId: string, fileId: string): Promise<string> => {
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  await createDir(path.join(libraryDir, FILES_DIR_NAME, fileId, EXTRACTIONS_DIR_NAME))
  return await getFileDir(workspaceId, libraryId, fileId)
}

export const getExtractionDir = async (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<string> => {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  return await getDir(path.join(fileDir, EXTRACTIONS_DIR_NAME, methodId))
}

export const createExtractionDir = async (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<string> => {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  await createDir(path.join(fileDir, EXTRACTIONS_DIR_NAME, methodId))
  return await getExtractionDir(workspaceId, libraryId, fileId, methodId)
}

export const getAttachmentsDir = async (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<string> => {
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, methodId)
  return await getDir(path.join(extractionDir, 'attachments'))
}

export async function getFolderStats(dirPath: string): Promise<{ diskSize: number; fileCount: number }> {
  logger.debug('Calculating folder stats', { dirPath })

  const entries = await readdir(dirPath, { withFileTypes: true })

  logger.debug('Read directory entries for folder stats calculation', { dirPath, entryCount: entries.length })

  const tasks = entries.map(async (entry) => {
    const fullPath = path.join(dirPath, entry.name)

    logger.debug('Calculating stats for entry', { dirPath, entryName: entry.name })

    if (entry.isDirectory()) {
      // Recursive call - don't wrap in limiter to avoid deadlock
      return await getFolderStats(fullPath)
    }

    if (entry.isFile()) {
      // Only wrap actual I/O operations in the limiter
      const fileStat = await GLOBAL_STORAGE_LIMIT(() => lstat(fullPath))
      return { diskSize: fileStat.size, fileCount: 1 }
    }

    return { diskSize: 0, fileCount: 0 }
  })

  logger.debug('Initiating folder stats calculation tasks', { dirPath, taskCount: tasks.length })

  const results = await Promise.all(tasks)

  logger.debug('Completed folder stats calculation for directory', { dirPath })

  // Use a simple loop for the final sum to avoid object allocation overhead in large arrays
  let totalSize = 0
  let totalFiles = 0

  for (const res of results) {
    totalSize += res.diskSize
    totalFiles += res.fileCount
  }

  return { diskSize: totalSize, fileCount: totalFiles }
}
