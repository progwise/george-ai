import { getConfigValue } from '@george-ai/app-commons'

import { fs } from '../commons'

export async function legacyFolderFiles(libraryId: string): Promise<Array<{
  fileId: string
  files: string[]
  subfolders: string[]
  error?: string
}> | null> {
  const legacyLibraryDir = fs.getFolderPath(getConfigValue('STORAGE_PATH_LEGACY_LIBRARIES'), libraryId)
  const libraryFolderExists = await fs.existsFolder(legacyLibraryDir)
  if (!libraryFolderExists) {
    return null
  }

  const folders = await fs.listFolders(legacyLibraryDir)

  const result = await Promise.allSettled(
    folders.map(async (folder) => {
      const subFolders = await fs.listFolders(fs.getFolderPath(legacyLibraryDir, folder))
      const files = await fs.listFiles(fs.getFolderPath(legacyLibraryDir, folder))
      return {
        sourceFilePath: fs.getFolderPath(legacyLibraryDir, folder),
        fileId: folder,
        files,
        subfolders: subFolders,
      }
    }),
  )

  return result.map((res) => {
    if (res.status === 'fulfilled') {
      return res.value
    } else {
      return {
        sourceFilePath: '',
        fileId: '',
        files: [],
        subfolders: [],
        error: res.reason instanceof Error ? res.reason.message : String(res.reason),
      }
    }
  })
}
