import path from 'node:path'

import { ROOT_DIR, logger } from './commons'
import { createLibrary } from './create-library'
import { exists } from './exists'
import { reconcile } from './reconcile'
import { upgradeLegacyFile } from './upgrade-legacy-file'

import { readdir } from 'fs/promises'

export async function upgradeLegacyLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    libraryName: string
    fileInfoLoader: (fileId: string) => Promise<{
      workspaceId: string
      libraryId: string
      fileId: string
      fileName: string
      mimeType: string
      createdAt: string
      uploadedAt: string
    }>
  },
): Promise<void> {
  const { libraryId, libraryName } = args
  const libraryExists = await exists(workspaceId, { libraryId })
  if (libraryExists) {
    logger.info('Library already exists, skipping upgrade for library', { workspaceId, libraryId })
    return
  }
  const legacyLibraryDir = path.join(ROOT_DIR, libraryId)
  await createLibrary(workspaceId, { libraryId, name: libraryName })

  const legacyFiles = await readdir(legacyLibraryDir, { withFileTypes: true })

  for (const entry of legacyFiles) {
    if (!entry.isDirectory()) {
      logger.warn('Skipping non-directory entry in legacy library directory', {
        workspaceId,
        libraryId,
        entryName: entry.name,
      })
      continue
    }
    const fileId = entry.name
    try {
      const fileInfo = await args.fileInfoLoader(fileId)
      // Upgrade each legacy file
      await upgradeLegacyFile(workspaceId, {
        libraryId,
        fileId,
        fileName: fileInfo.fileName,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt,
        uploadedAt: fileInfo.uploadedAt,
      })
      logger.info('Successfully upgraded legacy file', { workspaceId, libraryId, fileId })
    } catch (error) {
      logger.error('Error upgrading legacy file', { workspaceId, libraryId, fileId, error })
    }
  }

  await reconcile(workspaceId, { libraryId })
  return
}
