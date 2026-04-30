import path from 'path'

import { GLOBAL_STORAGE_LIMIT } from './commons'
import { existsFolder } from './exists-folder'

import { lstat, readdir } from 'fs/promises'

export async function calculateFolderStats(dirPath: string): Promise<{ diskSize: number; fileCount: number }> {
  const exists = await existsFolder(dirPath)
  if (!exists) {
    return { diskSize: 0, fileCount: 0 }
  }
  const entries = await readdir(dirPath, { withFileTypes: true })

  const tasks = entries.map(async (entry) => {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      // Recursive call - don't wrap in limiter to avoid deadlock
      return await calculateFolderStats(fullPath)
    }

    if (entry.isFile()) {
      // Only wrap actual I/O operations in the limiter
      const fileStat = await GLOBAL_STORAGE_LIMIT(() => lstat(fullPath))
      return { diskSize: fileStat.size, fileCount: 1 }
    }

    return { diskSize: 0, fileCount: 0 }
  })

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
