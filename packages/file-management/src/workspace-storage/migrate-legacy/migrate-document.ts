import { promises } from 'node:fs'
import path from 'node:path'

import { getConfigValue } from '@george-ai/app-commons'

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
  if (existsTargetDir) {
    const existingEntries = await readdir(targetDir, { withFileTypes: true })
    if (existingEntries.length === 0) {
      logger.debug('File directory already exists but is empty during migration - proceeding with migration', {
        workspaceId,
        libraryId,
        fileId,
        targetDir,
      })
    } else {
      logger.warn('File already exists during migration - skipping', {
        workspaceId,
        libraryId,
        fileId,
        targetDir,
      })
      return
    }
  }

  try {
    logger.debug('Copy legacy file', { workspaceId, libraryId, fileId, legacyFileDir, targetDir })
    await cp(legacyFileDir, targetDir, { recursive: true })

    logger.debug('Reading copied directory', { workspaceId, libraryId, fileId, targetDir })
    const entries = await readdir(targetDir, { withFileTypes: true })

    logger.debug('Analyzin directory content', {
      workspaceId,
      libraryId,
      fileId,
      targetDir,
      entries: entries.map((entry) => ({ name: entry.name, isFile: entry.isFile(), isDirectory: entry.isDirectory() })),
    })
    if (entries.length === 0) {
      logger.warn('File directory is empty, cannot upgrade legacy directory', { workspaceId, libraryId, fileId })
      await rm(targetDir, { recursive: true, force: true })
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
      await rm(targetDir, { recursive: true, force: true })
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
        analysesBytes: 0,
        analysesFileCount: 0,
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
      analyses: [],
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

    await reconcileDocument(documentIdentifier)
      .then(() => {
        logger.debug('Reconciled storage after legacy file upgrade', { workspaceId, libraryId, fileId })
      })
      .catch((error) => {
        logger.error('Error reconciling storage after legacy file upgrade', { workspaceId, libraryId, fileId, error })
      })
    logger.debug('Migration of legacy file completed', { workspaceId, libraryId, fileId })
  } catch (error) {
    logger.error('Error upgrading legacy file directory', { workspaceId, libraryId, fileId, error })

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

  return
}
