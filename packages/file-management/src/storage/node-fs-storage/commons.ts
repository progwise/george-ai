import path from 'node:path'
import pLimit from 'p-limit'

import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('file-management:node-fs-storage')

export const ROOT_DIR = process.env.UPLOADS_PATH || path.resolve('./uploads')
export const WORKSPACES_DIR_NAME = 'workspaces'
export const LIBRARIES_DIR_NAME = 'libraries'
export const FILES_DIR_NAME = 'files'
export const EXTRACTIONS_DIR_NAME = 'extractions'
export const SOURCE_FILE_NAME = 'source_file'

export const GLOBAL_STORAGE_LIMIT = pLimit(20)
/**
 * Helper to check if an error is a Node.js System Error (ErrnoException)
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

export function getFileDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === FILES_DIR_NAME) {
    return anyPath
  }
  return getFileDirFromPath(dirname)
}

export function getLibraryDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === LIBRARIES_DIR_NAME) {
    return anyPath
  }
  return getLibraryDirFromPath(dirname)
}

export function getWorkspaceDirFromPath(anyPath: string): string {
  const dirname = path.dirname(anyPath)
  if (path.basename(dirname) === WORKSPACES_DIR_NAME) {
    return anyPath
  }
  return getWorkspaceDirFromPath(dirname)
}

export async function* lineSplitter(source: AsyncIterable<Buffer | string>): AsyncGenerator<string> {
  let remainder = ''
  for await (const chunk of source) {
    const data = remainder + chunk.toString()
    const lines = data.split(/\r?\n/)
    // Keep the last partial line
    remainder = lines.pop() ?? ''
    for (const line of lines) {
      yield line
    }
  }
  if (remainder) yield remainder
}
