import { promises } from 'node:fs'
import path from 'path'

import { FileManifest } from '../../schemas'
import {
  EXTRACTIONS_DIR_NAME,
  FILES_DIR_NAME,
  LIBRARIES_DIR_NAME,
  ROOT_DIR,
  SOURCE_FILE_NAME,
  WORKSPACES_DIR_NAME,
  logger,
} from './commons'
import { exists } from './exists'
import { getSourceHash } from './get-source-hash'
import { saveExtractionMetadata, saveFileManifest } from './metadata-files'
import { reconcile } from './reconcile'

const { cp, lstat, mkdir, readdir, rename, rmdir } = promises

export async function migrateLegacyFile(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    fileName: string
    mimeType: string
    createdAt: string
    uploadedAt?: string | null
    hash?: string | null
  },
): Promise<void> {
  const { libraryId, fileId } = args
  const libraryExists = await exists(workspaceId, { libraryId })
  if (!libraryExists) {
    logger.warn('Library does not exist, cannot upgrade legacy file', { workspaceId, libraryId, fileId })
    return
  }
  const fileExists = await exists(workspaceId, { libraryId, fileId })
  if (fileExists) {
    logger.info('File already exists, skipping upgrade for file', { workspaceId, libraryId, fileId })
    return
  }

  const tempFileDir = path.join(
    ROOT_DIR,
    WORKSPACES_DIR_NAME,
    workspaceId,
    LIBRARIES_DIR_NAME,
    libraryId,
    FILES_DIR_NAME,
    `${fileId}-temp-upgrade`,
  )
  const targetFileDir = path.join(
    ROOT_DIR,
    WORKSPACES_DIR_NAME,
    workspaceId,
    LIBRARIES_DIR_NAME,
    libraryId,
    FILES_DIR_NAME,
    fileId,
  )

  logger.debug('Starting upgrade of legacy file directory', {
    workspaceId,
    libraryId,
    fileId,
    tempFileDir,
    targetFileDir,
  })

  try {
    await cp(path.join(ROOT_DIR, libraryId, fileId), tempFileDir, { recursive: true })

    const entries = await readdir(tempFileDir, { withFileTypes: true })

    logger.debug('Read entries in legacy file directory during upgrade', {
      workspaceId,
      libraryId,
      fileId,
      tempFileDir,
      entries: entries.map((e) => e.name),
    })

    if (entries.length === 0) {
      logger.warn('File directory is empty, cannot upgrade legacy directory', { workspaceId, libraryId, fileId })
      return
    }

    const uploadFile = entries.find((entry) => entry.isFile() && entry.name === 'upload')

    logger.debug('Located upload file in legacy file directory during upgrade', {
      workspaceId,
      libraryId,
      fileId,
      uploadFileName: uploadFile?.name,
    })

    if (!uploadFile) {
      logger.warn('Upload file not found in legacy directory, cannot upgrade', { workspaceId, libraryId, fileId })
      return
    }

    const tempSourceFilePath = path.join(tempFileDir, SOURCE_FILE_NAME)

    await rename(path.join(tempFileDir, uploadFile.name), tempSourceFilePath)

    logger.debug('Renamed upload file to source file during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      from: path.join(tempFileDir, uploadFile.name),
      to: tempSourceFilePath,
    })

    const sourceFileInfo = await lstat(tempSourceFilePath)
    logger.debug('Retrieved source file info during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      sourceFileInfo,
      path: tempSourceFilePath,
    })

    await mkdir(path.join(tempFileDir, EXTRACTIONS_DIR_NAME), { recursive: true })

    logger.debug('Created extractions directory during legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      path: path.join(tempFileDir, EXTRACTIONS_DIR_NAME),
    })

    const fileManifest: FileManifest = {
      version: 1,
      id: fileId,
      fileName: args.fileName,
      createdAt: sourceFileInfo.birthtime.toISOString(),
      mimeType: args.mimeType,
      sourceHash: await getSourceHash(tempFileDir),
      extractions: [],
      usage: {
        sourceBytes: sourceFileInfo.size,
        activeExtractedBytes: 0,
        physicalBytes: 0,
        lastUpdate: new Date().toISOString(),
        sourceFiles: 0,
        physicalFiles: 0,
        extractions: 0,
        extractedBytes: 0,
        activeExtractions: 0,
        extractionFiles: 0,
      },
      originalContentHash: args.hash || null,
      originalUpdatedAt: args.uploadedAt || args.createdAt,
    }

    logger.debug('Constructed file manifest for legacy file upgrade', {
      workspaceId,
      libraryId,
      fileId,
      tempFileDir,
      fileManifest,
    })

    for (const entry of entries) {
      if (entry.isFile() && entry.name === 'upload') {
        continue
      }
      if (entry.isDirectory() && entry.name.endsWith('_buckets')) {
        logger.debug('Buckets directory found in legacy file directory during upgrade. Moving', {
          workspaceId,
          libraryId,
          fileId,
          dirName: entry.name,
        })
        await rename(
          path.join(tempFileDir, entry.name),
          path.join(tempFileDir, EXTRACTIONS_DIR_NAME, 'legacyExtraction', 'fragments'),
        )
        continue
      }
      if (entry.isDirectory() && entry.name !== EXTRACTIONS_DIR_NAME) {
        logger.warn('Unexpected directory found in legacy file directory during upgrade', {
          workspaceId,
          libraryId,
          fileId,
          dirName: entry.name,
        })
        continue
      }
      if (!entry.name.endsWith('.md')) {
        logger.warn('Skipping non-relevant entry in legacy file directory during upgrade', {
          workspaceId,
          libraryId,
          fileId,
          fileName: entry.name,
        })
        continue
      }
      if (!entry.isFile()) {
        logger.warn('Skipping non-file entry in legacy file directory during upgrade', {
          workspaceId,
          libraryId,
          fileId,
          fileName: entry.name,
        })
        continue
      }
      const extractionFileInfo = await lstat(path.join(tempFileDir, entry.name))

      const extractionType = 'legacyExtraction'

      await mkdir(path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType), { recursive: true })
      logger.debug('Created extraction directory during legacy file upgrade', {
        workspaceId,
        libraryId,
        fileId,
        extractionType,
        path: path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType),
      })
      await rename(
        path.join(tempFileDir, entry.name),
        path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType, 'output.md'),
      )
      logger.debug('Moved legacy extraction file during upgrade', {
        workspaceId,
        libraryId,
        fileId,
        from: path.join(tempFileDir, entry.name),
        to: path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType, 'output.md'),
      })

      const extractionHash =
        sourceFileInfo.birthtime > extractionFileInfo.birthtime ? 'unknown' : await getSourceHash(tempFileDir)

      await saveExtractionMetadata(path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType), {
        version: 1,
        extractionMethod: 'legacyExtraction',
        sourceHash: extractionHash,
        extractedBytes: extractionFileInfo.size,
        extractionFiles: 1,
        extractedAt: extractionFileInfo.birthtime.toISOString(),
        physicalBytes: extractionFileInfo.size,
        hasFragments: false,
        physicalFiles: 1,
      })

      fileManifest.extractions.push({
        extractionMethod: 'legacyExtraction',
        extractionDate: extractionFileInfo.birthtime.toISOString(),
        extractionHash: extractionHash,
      })
    }

    logger.debug('Prepared legacy file directory for upgrade', {
      workspaceId,
      libraryId,
      fileId,
      tempFileDir,
      fileManifest,
    })

    await saveFileManifest(tempFileDir, fileManifest)

    logger.debug('Successfully prepared legacy file directory for upgrade', {
      workspaceId,
      libraryId,
      fileId,
      tempFileDir,
      fileManifest,
    })

    // Finally, move the entire directory to the new location
    await rename(tempFileDir, targetFileDir)

    logger.debug('Successfully renamed legacy file directory', {
      workspaceId,
      libraryId,
      fileId,
      tempFileDir,
      targetFileDir,
    })

    await reconcile(workspaceId, { libraryId, fileId })
    logger.debug('Reconciled storage after legacy file upgrade', { workspaceId, libraryId, fileId })
    await rmdir(path.join(ROOT_DIR, libraryId, fileId), { recursive: true })
    logger.debug('Cleaned up legacy file directory after successful upgrade', {
      path: path.join(ROOT_DIR, libraryId, fileId),
      workspaceId,
      libraryId,
      fileId,
    })
    return
  } catch (error) {
    console.error('Error upgrading legacy file', { workspaceId, libraryId, fileId, error })
    logger.error('Error upgrading legacy file directory', { workspaceId, libraryId, fileId, error })
    // Cleanup temp directory if exists
    // await rmdir(tempFileDir, { recursive: true }).catch(() => {
    //   logger.warn('Failed to cleanup temp directory after failed upgrade', { workspaceId, libraryId, fileId })
    // })
    // await rmdir(targetFileDir, { recursive: true }).catch(() => {
    //   logger.warn('Failed to cleanup target directory after failed upgrade', { workspaceId, libraryId, fileId })
    // })
    return
  }
}
