import { readdir } from 'node:fs/promises'

import { getMimeTypeFromFileName } from '@george-ai/app-commons'

import { getFilePath } from './get-file-path'
import { getFileStats } from './get-file-stats'
import { getFolderPath } from './get-folder-path'

export async function fileTree(parentPath: string): Promise<
  Array<{
    parentPath: string
    name: string
    mimeType?: string
    size: number
    modifiedTime: Date
  }>
> {
  let entries: import('node:fs').Dirent<string>[]
  try {
    entries = await readdir(parentPath, { withFileTypes: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
  const folders = entries.filter((entry) => entry.isDirectory())
  const files = entries.filter((entry) => entry.isFile())
  const result: Array<{
    parentPath: string
    name: string
    mimeType?: string
    size: number
    modifiedTime: Date
  }> = []

  for (const file of files) {
    const fileStats = await getFileStats(getFilePath(parentPath, file.name))
    result.push({
      parentPath,
      name: file.name,
      mimeType: getMimeTypeFromFileName(file.name),
      size: fileStats?.diskSize || 0,
      modifiedTime: fileStats?.modified || new Date(0),
    })
  }

  for (const folder of folders) {
    const folderResult = await fileTree(getFolderPath(parentPath, folder.name))
    result.push(...folderResult)
  }

  return result
}
