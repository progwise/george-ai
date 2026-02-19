import { readdir } from 'node:fs/promises'

import { existsFolder } from './exists-folder'

export async function listFolders(parentPath: string): Promise<string[]> {
  const exists = await existsFolder(parentPath)
  if (!exists) {
    return []
  }
  const entries = await readdir(parentPath, { withFileTypes: true })
  const folderNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  return folderNames
}
