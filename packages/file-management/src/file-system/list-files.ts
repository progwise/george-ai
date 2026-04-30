import { readdir } from 'node:fs/promises'

import { existsFolder } from './exists-folder'

export async function listFiles(parentPath: string): Promise<Array<string>> {
  const exists = await existsFolder(parentPath)
  if (!exists) {
    return []
  }
  const entries = await readdir(parentPath, { withFileTypes: true })
  const folderNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
  return folderNames
}
