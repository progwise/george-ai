import { rename } from 'node:fs/promises'

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  await rename(oldPath, newPath)
}
