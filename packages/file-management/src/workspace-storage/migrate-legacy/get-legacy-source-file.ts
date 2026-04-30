import { lstat } from 'node:fs/promises'
import path from 'node:path'

import { fs } from '../commons'

export async function getLegacySourceFile(targetDir: string): Promise<{
  size: number
  birthtime: Date
  mtime: Date
} | null> {
  const sourcePath = path.join(targetDir, 'upload')
  const exists = await fs.existsFile(sourcePath)
  if (!exists) {
    return null
  }

  const stats = await lstat(sourcePath)
  if (!stats.isFile()) {
    throw new Error(`Expected legacy source file to be a file, but it is not: ${sourcePath}`)
  }

  return stats
}
