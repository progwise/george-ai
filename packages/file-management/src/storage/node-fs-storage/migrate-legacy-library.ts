import path from 'node:path'

import { ROOT_DIR, logger } from './commons'
import { createLibrary } from './create-library'
import { createWorkspace } from './create-workspace'
import { exists } from './exists'
import { migrateLegacyFile } from './migrate-legacy-file'
import { reconcile } from './reconcile'

import { readdir } from 'fs/promises'

export async function migrateLegacyLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    libraryName: string
    workspaceName: string
    fileInfoLoader: (fileId: string) => Promise<{
      workspaceId: string
      libraryId: string
      fileId: string
      fileName: string
      mimeType: string
      createdAt: string
      uploadedAt?: string | null
      hash?: string | null
    }>
  },
): Promise<void> {
  const { libraryId, libraryName, workspaceName } = args
  const workspaceExists = await exists(workspaceId, {})
  if (!workspaceExists) {
    logger.info('Workspace does not exist, creating workspace before upgrading legacy library', { workspaceId })
    await createWorkspace(workspaceId, { name: workspaceName })
  }
  const libraryExists = await exists(workspaceId, { libraryId })
  if (!libraryExists) {
    logger.info('Library does not exist, creating', { workspaceId, libraryId })
    await createLibrary(workspaceId, { libraryId, name: libraryName })
  }
  const legacyLibraryDir = path.join(ROOT_DIR, libraryId)
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
      if (!fileInfo) {
        logger.warn('File info not found during legacy file upgrade, skipping file', { workspaceId, libraryId, fileId })
        continue
      }
      // Upgrade each legacy file
      await migrateLegacyFile(workspaceId, {
        libraryId,
        fileId,
        fileName: fileInfo.fileName,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt,
        uploadedAt: fileInfo.uploadedAt,
        hash: fileInfo.hash,
      })
      logger.debug('Successfully upgraded legacy file', { workspaceId, libraryId, fileId })
    } catch (error) {
      logger.error('Error upgrading legacy file', { workspaceId, libraryId, fileId, error })
    }
  }

  await reconcile(workspaceId, { libraryId })
  return
}
