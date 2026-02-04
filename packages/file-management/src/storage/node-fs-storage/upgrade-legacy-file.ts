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

export async function upgradeLegacyFile(
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

  try {
    await cp(path.join(ROOT_DIR, libraryId, fileId), tempFileDir, { recursive: true })

    const entries = await readdir(tempFileDir, { withFileTypes: true })

    if (entries.length === 0) {
      logger.warn('File directory is empty, cannot upgrade legacy directory', { workspaceId, libraryId, fileId })
      return
    }

    const uploadFile = entries.find((entry) => entry.isFile() && entry.name === 'upload')

    if (!uploadFile) {
      logger.warn('Upload file not found in legacy directory, cannot upgrade', { workspaceId, libraryId, fileId })
      return
    }

    await rename(path.join(tempFileDir, uploadFile.name), path.join(tempFileDir, SOURCE_FILE_NAME))

    const sourceFileInfo = await lstat(path.join(tempFileDir, SOURCE_FILE_NAME))

    await mkdir(path.join(tempFileDir, EXTRACTIONS_DIR_NAME), { recursive: true })

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

    for (const entry of entries) {
      if (entry.isFile() && entry.name === 'upload') {
        continue
      }
      if (entry.isDirectory() && entry.name.endsWith('_buckets')) {
        logger.info('Buckets directory found in legacy file directory during upgrade. Moving', {
          workspaceId,
          libraryId,
          fileId,
          dirName: entry.name,
        })
        await rename(
          path.join(tempFileDir, entry.name),
          path.join(tempFileDir, EXTRACTIONS_DIR_NAME, 'legacy-csv', 'sharded-buckets'),
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

      let extractionType = 'legacyExtraction'
      if (entry.name.includes('text')) {
        extractionType = 'legacy-text'
      } else if (entry.name.includes('ocr')) {
        extractionType = 'legacy-ocr'
      } else if (entry.name.includes('pdf-image')) {
        extractionType = 'legacy-pdf-image'
      } else if (entry.name.includes('pdf')) {
        extractionType = 'legacy-pdf'
      } else if (entry.name.includes('csv')) {
        extractionType = 'legacy-csv'
      } else if (entry.name.includes('word')) {
        extractionType = 'legacy-word'
      } else if (entry.name.includes('excel')) {
        extractionType = 'legacy-excel'
      }

      await mkdir(path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType), { recursive: true })
      await rename(
        path.join(tempFileDir, entry.name),
        path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType, 'extracted.md'),
      )
      saveExtractionMetadata(path.join(tempFileDir, EXTRACTIONS_DIR_NAME, extractionType), {
        version: 1,
        extractionMethod: 'legacyExtraction',
        sourceHash:
          sourceFileInfo.birthtime > extractionFileInfo.birthtime ? 'unknown' : await getSourceHash(tempFileDir),
        extractedBytes: extractionFileInfo.size,
        extractionFiles: 1,
        extractedAt: extractionFileInfo.birthtime.toISOString(),
        physicalBytes: extractionFileInfo.size,
        hasFragments: false,
        physicalFiles: 1,
      })
    }

    await saveFileManifest(tempFileDir, fileManifest)

    // Finally, move the entire directory to the new location
    await rename(tempFileDir, targetFileDir)

    logger.info('Successfully upgraded legacy file directory', { workspaceId, libraryId, fileId })

    await reconcile(workspaceId, { libraryId, fileId })
    await rmdir(path.join(ROOT_DIR, libraryId, fileId), { recursive: true })
    return
  } catch (error) {
    logger.error('Error upgrading legacy file directory', { workspaceId, libraryId, fileId, error })
    // Cleanup temp directory if exists
    await rmdir(tempFileDir, { recursive: true }).catch(() => {
      logger.warn('Failed to cleanup temp directory after failed upgrade', { workspaceId, libraryId, fileId })
    })
    await rmdir(targetFileDir, { recursive: true }).catch(() => {
      logger.warn('Failed to cleanup target directory after failed upgrade', { workspaceId, libraryId, fileId })
    })
    return
  }
}
