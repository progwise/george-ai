import { promises } from 'node:fs'
import path from 'node:path'

import { getConfigValue } from '@george-ai/app-commons'

import { BackupInfo, backup, restore } from '../backup'
import { fs, getLegacyUri, logger } from '../commons'
import { calculateSourceHash, getSourcePath } from '../document'
import { entryExists, getEntryPath, saveEntry } from '../entry'
import { reconcileDocument } from '../reconcile'
import { DocumentIdentifier, DocumentManifest } from '../schema'
import { createExtractionsFromLegacy } from './create-extractions-from-legacy'
import { LegacyFileInfo } from './legacy-file-loader'

const { cp, lstat, readdir, rename, rm } = promises

export async function migrateDocument(workspaceId: string, legacyFileInfo: LegacyFileInfo): Promise<void> {
  const { libraryId, fileId } = legacyFileInfo

  const documentIdentifier: DocumentIdentifier = {
    version: 1,
    workspaceId,
    libraryId,
    documentId: fileId,
    type: 'document',
  }

  const legacyFileDir = await fs.getFolderPathOrThrow(
    [getConfigValue('STORAGE_PATH_LEGACY_LIBRARIES'), libraryId, fileId],
    'Legacy file directory does not exist',
  )

  const targetDir = getEntryPath(documentIdentifier)
  const existsTargetDir = await fs.existsFolder(targetDir)
  let backupInfo: BackupInfo | null = null
  if (existsTargetDir) {
    backupInfo = await backup(documentIdentifier)
    logger.warn('File already exists, creating a backup', { workspaceId, libraryId, fileId, targetDir, backupInfo })
  }

  try {
    await cp(legacyFileDir, targetDir, { recursive: true })

    const entries = await readdir(targetDir, { withFileTypes: true })

    if (entries.length === 0) {
      logger.warn('File directory is empty, cannot upgrade legacy directory', { workspaceId, libraryId, fileId })
      return
    }

    const uploadFile = entries.find((entry) => entry.isFile() && entry.name === 'upload')

    logger.debug('Located legacy upload file', {
      workspaceId,
      libraryId,
      fileId,
      targetDir,
      uploadFile,
    })

    if (!uploadFile) {
      logger.warn('Upload file not found in legacy directory, cannot upgrade', {
        workspaceId,
        libraryId,
        fileId,
        targetDir,
      })
      return
    }

    const uploadFilePath = path.join(targetDir, uploadFile.name)
    const sourceFilePath = getSourcePath(documentIdentifier)
    await rename(uploadFilePath, sourceFilePath)

    logger.debug('Renamed upload file to source file during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      from: uploadFilePath,
      to: sourceFilePath,
    })

    const sourceFileInfo = await lstat(sourceFilePath)
    logger.debug('Retrieved source file info during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      sourceFileInfo,
      sourceFilePath,
    })

    const sourceHash = await calculateSourceHash(documentIdentifier)
    logger.debug('Calculated source file hash during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      sourceHash,
    })

    const documentManifest: DocumentManifest = {
      type: 'document',
      version: 1,
      documentId: fileId,
      name: legacyFileInfo.name,
      created: sourceFileInfo.birthtime,
      updated: new Date(),
      creator: legacyFileInfo.crawledByCrawlerId ? `legacy crawler:${legacyFileInfo.crawledByCrawlerId}` : 'legacy',
      mimeType: legacyFileInfo.mimeType,
      sourceHash,
      extractions: [],
      storageStats: {
        physicalBytes: sourceFileInfo.size,
        lastUpdate: new Date(),
        extractionBytes: 0,
        attachmentBytes: 0,
        extractionFileCount: 0,
        attachmentFileCount: 0,
        physicalFileCount: 1,
      },
      origin: {
        uri: legacyFileInfo.originUri || getLegacyUri({ libraryId, fileId }),
        author: 'legacy migration',
        creationDate: legacyFileInfo.originModificationDate
          ? new Date(legacyFileInfo.originModificationDate)
          : undefined,
        hash: legacyFileInfo.originFileHash || undefined,
        lastModifiedDate: legacyFileInfo.originModificationDate
          ? new Date(legacyFileInfo.originModificationDate)
          : undefined,
      },
      workspaceId,
      attachments: [],
      libraryId: libraryId,
    }

    logger.debug('Constructed file manifest for legacy file upgrade', {
      workspaceId,
      libraryId,
      documentId: fileId,
      documentManifest,
    })

    await saveEntry(documentManifest)
    logger.debug('Saved file manifest during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      targetDir,
    })

    const extractions = await createExtractionsFromLegacy(documentManifest)

    logger.debug('created extractions from legacy', {
      workspaceId,
      libraryId,
      fileId,
      extractions,
    })
  } catch (error) {
    console.error('Error upgrading legacy file', { workspaceId, libraryId, fileId, error })
    logger.error('Error upgrading legacy file directory', { workspaceId, libraryId, fileId, error })

    // restore from backup if there was a previous version of the file
    if (backupInfo !== null) {
      await restore(documentIdentifier, { timestamp: backupInfo.timestamp })
    } else {
      // if there was no previous version, attempt to clean up the target directory
      const existsTargetDir = await entryExists(documentIdentifier)
      if (existsTargetDir) {
        await rm(targetDir, { recursive: true, force: true }).catch((rmError) => {
          logger.error('Failed to clean up target directory after legacy file upgrade failure', {
            workspaceId,
            libraryId,
            fileId,
            targetDir,
            error: rmError,
          })
        })
      }
    }
  }

  await reconcileDocument(documentIdentifier)
    .then(() => {
      logger.debug('Reconciled storage after legacy file upgrade', { workspaceId, libraryId, fileId })
    })
    .catch((error) => {
      logger.error('Error reconciling storage after legacy file upgrade', { workspaceId, libraryId, fileId, error })
    })

  logger.info('Migration of legacy file ended', { workspaceId, libraryId, fileId })
  return
}
