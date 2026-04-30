import { rename } from 'node:fs/promises'

import { deleteFile } from './delete-file'
import { existsFile } from './exists-file'

export async function stashFile(filePath: string): Promise<{ pop: () => Promise<void>; drop: () => Promise<void> }> {
  const exists = await existsFile(filePath)
  const stashPath = `${filePath}.stash-${Date.now()}`
  if (!exists) {
    return {
      pop: async () => {
        // No file to pop, do nothing
      },
      drop: async () => {
        // No file to drop, do nothing
      },
    }
  }

  await rename(filePath, stashPath)

  return {
    pop: async () => {
      const stashExists = await existsFile(stashPath)
      if (stashExists) {
        await rename(stashPath, filePath)
      }
    },
    drop: async () => {
      const stashExists = await existsFile(stashPath)
      if (stashExists) {
        await deleteFile(stashPath)
      }
    },
  }
}
