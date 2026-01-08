import path from 'node:path'
import pLimit from 'p-limit'

export const GLOBAL_STORAGE_LIMIT = pLimit(20)
/**
 * Helper to check if an error is a Node.js System Error (ErrnoException)
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

export function getFileDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === 'files') {
    return anyPath
  }
  return getFileDirFromPath(dirname)
}

export function getLibraryDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === 'libraries') {
    return anyPath
  }
  return getLibraryDirFromPath(dirname)
}

export function getWorkspaceDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === 'workspaces') {
    return anyPath
  }
  return getWorkspaceDirFromPath(dirname)
}
