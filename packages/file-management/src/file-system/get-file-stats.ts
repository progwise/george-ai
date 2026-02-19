import { lstat } from 'node:fs/promises'

import { GLOBAL_STORAGE_LIMIT } from './commons'

export async function getFileStats(path: string): Promise<{ diskSize: number; created: Date; modified: Date } | null> {
  const sourceFileStat = await GLOBAL_STORAGE_LIMIT(() => lstat(path).catch(() => null))

  if (!sourceFileStat) {
    return null
  }

  return { diskSize: sourceFileStat.size, created: sourceFileStat.birthtime, modified: sourceFileStat.mtime }
}
