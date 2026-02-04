import { promises } from 'node:fs'
import path from 'node:path'
import pLimit from 'p-limit'

import { StorageUsage } from '../../schemas'
import { EXTRACTIONS_DIR_NAME, SOURCE_FILE_NAME, logger } from './commons'
import { getFileDir, getFolderStats, getLibraryDir, getWorkspaceDir } from './directories'
import { getSourceHash } from './get-source-hash'
import {
  getExtractionMetadata,
  getFileManifest,
  getLibraryManifest,
  getWorkspaceManifest,
  saveFileManifest,
  saveLibraryManifest,
  saveWorkspaceManifest,
} from './metadata-files'

const { readdir, stat } = promises

export async function reconcile(
  workspaceId: string,
  options?: { libraryId?: string; fileId?: string },
): Promise<StorageUsage> {
  const { libraryId, fileId } = options || {}

  logger.debug('Starting reconciliation process', { workspaceId, libraryId, fileId })
  if (fileId && !libraryId) {
    logger.error('libraryId must be provided if fileId is provided', { workspaceId, fileId })
    throw new Error('libraryId must be provided if fileId is provided')
  }
  if (fileId && libraryId) {
    const fileDir = await getFileDir(workspaceId, libraryId, fileId)
    const usage = await reconcileFile(fileDir)
    return usage
  }
  if (libraryId) {
    const libraryDir = await getLibraryDir(workspaceId, libraryId)
    const usage = await reconcileLibrary(libraryDir)
    return usage
  }
  const workspaceDir = await getWorkspaceDir(workspaceId)
  return await reconcileWorkspace(workspaceDir)
}

async function reconcileFile(fileDirPath: string): Promise<StorageUsage> {
  const fileManifest = await getFileManifest(fileDirPath)
  if (!fileManifest) {
    throw new Error(`File manifest not found for file dir: ${fileDirPath}`)
  }
  logger.debug('Reconciling file', { fileDirPath })
  fileManifest.sourceHash = await getSourceHash(fileDirPath)
  const methods = await readdir(path.join(fileDirPath, EXTRACTIONS_DIR_NAME)).catch(() => [])

  const fileDirStats = await getFolderStats(fileDirPath)
  const sourceFileStats = await stat(path.join(fileDirPath, SOURCE_FILE_NAME)).catch(() => ({ size: 0 }))

  const newUsage: StorageUsage = {
    sourceBytes: sourceFileStats.size,
    extractedBytes: fileDirStats.diskSize - sourceFileStats.size,
    physicalBytes: fileDirStats.diskSize,
    sourceFiles: 1,
    physicalFiles: fileDirStats.fileCount,
    extractions: 0,
    activeExtractions: 0,
    activeExtractedBytes: 0,
    extractionFiles: 0,
  }

  logger.debug('Calculated base usage for file during reconciliation', {
    fileDirPath,
    newUsage,
  })

  const extractionMetas = await Promise.all(
    methods.map((methodId) =>
      getExtractionMetadata(path.join(fileDirPath, 'extractions', methodId)).then((meta) =>
        meta === null ? Promise.reject(new Error(`Extraction metadata not found for method dir: ${methodId}`)) : meta,
      ),
    ),
  )

  for (const extractionMeta of extractionMetas) {
    newUsage.extractionFiles += extractionMeta.extractionFiles
    newUsage.extractions += 1
    newUsage.extractedBytes += extractionMeta.extractedBytes
    if (fileManifest.sourceHash === extractionMeta.sourceHash) {
      newUsage.activeExtractedBytes += extractionMeta.extractedBytes
      newUsage.activeExtractions += 1
    }
  }

  // Update manifest with new truth
  fileManifest.usage = {
    ...fileManifest.usage,
    ...newUsage,
    ...{ lastReconcile: new Date().toISOString(), lastUpdate: new Date().toISOString() },
  }

  logger.debug('Updated file manifest usage during reconciliation', {
    fileDirPath,
    fileManifestUsage: fileManifest.usage,
  })
  await saveFileManifest(fileDirPath, fileManifest)

  logger.debug('Saved updated file manifest after reconciliation', { fileDirPath })
  return fileManifest.usage
}

const limit = pLimit(20)

async function reconcileLibrary(libDirPath: string): Promise<StorageUsage> {
  const filesDir = path.join(libDirPath, 'files')
  const fileIds = await readdir(filesDir).catch(() => [])
  const libraryManifest = await getLibraryManifest(libDirPath)

  if (!libraryManifest) {
    throw new Error(`Library manifest not found for library dir: ${libDirPath}`)
  }

  logger.debug('Reconciling library', { libDirPath, fileCount: fileIds.length })

  const libraryDirStats = await getFolderStats(libDirPath)

  logger.debug('Calculated base stats for library during reconciliation', {
    libDirPath,
    libraryDirStats,
  })

  const newUsage: StorageUsage = {
    sourceBytes: 0,
    extractedBytes: 0,
    physicalBytes: libraryDirStats.diskSize,
    sourceFiles: 0,
    physicalFiles: libraryDirStats.fileCount,
    extractions: 0,
    activeExtractions: 0,
    activeExtractedBytes: 0,
    extractionFiles: 0,
  }

  const filePromises = fileIds.map((fId) =>
    limit(async () => {
      const filePath = path.join(filesDir, fId)
      return reconcileFile(filePath)
    }),
  )

  const fileStats = await Promise.all(filePromises)

  for (const stats of fileStats) {
    newUsage.sourceBytes += stats.sourceBytes
    newUsage.extractedBytes += stats.extractedBytes
    newUsage.activeExtractedBytes += stats.activeExtractedBytes
    newUsage.sourceFiles += stats.sourceFiles
    newUsage.extractions += stats.extractions
    newUsage.activeExtractions += stats.activeExtractions
    newUsage.extractionFiles += stats.extractionFiles
  }

  libraryManifest.usage = {
    ...libraryManifest.usage,
    ...newUsage,
    ...{ lastReconcile: new Date().toISOString(), lastUpdate: new Date().toISOString() },
  }

  logger.debug('Updated library manifest usage during reconciliation', {
    libDirPath,
    libraryManifestUsage: libraryManifest.usage,
  })
  await saveLibraryManifest(libDirPath, libraryManifest)

  logger.debug('Saved updated library manifest after reconciliation', { libDirPath })

  return libraryManifest.usage
}

async function reconcileWorkspace(workspaceDirPath: string): Promise<StorageUsage> {
  const librariesDir = path.join(workspaceDirPath, 'libraries')
  const libraryIds = await readdir(librariesDir).catch(() => [])

  const workspaceDirStats = await getFolderStats(workspaceDirPath)

  const newUsage: StorageUsage = {
    sourceBytes: 0,
    extractedBytes: 0,
    physicalBytes: workspaceDirStats.diskSize,
    sourceFiles: 0,
    physicalFiles: workspaceDirStats.fileCount,
    extractions: 0,
    activeExtractions: 0,
    activeExtractedBytes: 0,
    extractionFiles: 0,
  }

  for (const libId of libraryIds) {
    const libPath = path.join(librariesDir, libId)
    const stats = await reconcileLibrary(libPath)
    newUsage.sourceBytes += stats.sourceBytes
    newUsage.extractedBytes += stats.extractedBytes
    newUsage.activeExtractedBytes += stats.activeExtractedBytes
    newUsage.sourceFiles += stats.sourceFiles
    newUsage.extractions += stats.extractions
    newUsage.activeExtractions += stats.activeExtractions
    newUsage.extractionFiles += stats.extractionFiles
  }

  const manifest = await getWorkspaceManifest(workspaceDirPath)
  if (!manifest) {
    throw new Error(`Workspace manifest not found for workspace dir: ${workspaceDirPath}`)
  }
  manifest.usage = {
    ...manifest.usage,
    ...newUsage,
    ...{ lastReconcile: new Date().toISOString(), lastUpdate: new Date().toISOString() },
  }
  await saveWorkspaceManifest(workspaceDirPath, manifest)

  return manifest.usage
}
