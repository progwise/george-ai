import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import pLimit from 'p-limit'

import { StorageStats } from '../../schemas'
import { getFileDir, getFolderStats, getLibraryDir, getWorkspaceDir } from './directories'
import {
  getExtractionMetadata,
  getFileManifest,
  getLibraryManifest,
  getWorkspaceManifest,
  saveFileManifest,
  saveLibraryManifest,
  saveWorkspaceManifest,
} from './metadata-files'

export async function reconcile(workspaceId: string, libraryId?: string, fileId?: string): Promise<StorageStats> {
  if (fileId && !libraryId) {
    throw new Error('libraryId must be provided if fileId is provided')
  }
  if (fileId && libraryId) {
    const fileDir = await getFileDir(workspaceId, libraryId, fileId)
    const stats = await reconcileFile(fileDir)
    return stats
  }
  if (libraryId) {
    const libraryDir = await getLibraryDir(workspaceId, libraryId)
    const stats = await reconcileLibrary(libraryDir)
    return stats
  }
  const workspaceDir = await getWorkspaceDir(workspaceId)
  return await reconcileWorkspace(workspaceDir)
}

async function reconcileFile(fileDirPath: string): Promise<StorageStats> {
  const fileManifest = await getFileManifest(fileDirPath)

  const sourcePath = path.join(fileDirPath, 'source')
  const sourceStats = await stat(sourcePath).catch(() => ({ size: 0 }))

  let physicalBytes = sourceStats.size
  let activeBytes = sourceStats.size
  let physicalFiles = 1 // The source file
  let activeFiles = 1

  const extractionsDir = path.join(fileDirPath, 'extractions')
  const methods = await readdir(extractionsDir).catch(() => [])

  for (const methodId of methods) {
    const methodPath = path.join(extractionsDir, methodId)
    const meta = await getExtractionMetadata(methodPath)
    if (!meta) continue

    const { diskSize, fileCount } = await getFolderStats(methodPath)

    physicalBytes += diskSize
    physicalFiles += fileCount

    // Truth Check: If hashes match, it is active
    if (meta.sourceHashAtExecution === fileManifest.currentSourceHash) {
      activeBytes += diskSize
      activeFiles += fileCount
    }
  }

  const updatedStats: StorageStats = {
    activeBytes,
    physicalBytes,
    activeFileCount: activeFiles,
    totalFileCount: physicalFiles,
    lastUpdated: new Date().toISOString(),
    lastFullScan: new Date().toISOString(),
    integrityState: 'reconciled',
  }

  // Update manifest with new truth
  fileManifest.usage = { ...fileManifest.usage, ...updatedStats }
  await saveFileManifest(fileDirPath, fileManifest)

  return updatedStats
}

const limit = pLimit(20)

async function reconcileLibrary(libDirPath: string): Promise<StorageStats> {
  const filesDir = path.join(libDirPath, 'files')
  const fileIds = await readdir(filesDir).catch(() => [])

  const totals: StorageStats = {
    activeBytes: 0,
    physicalBytes: 0,
    activeFileCount: 0,
    totalFileCount: 0,
    lastUpdated: new Date().toISOString(),
    lastFullScan: new Date().toISOString(),
    integrityState: 'reconciled',
  }

  const filePromises = fileIds.map((fId) =>
    limit(async () => {
      const filePath = path.join(filesDir, fId)
      return reconcileFile(filePath)
    }),
  )

  const fileStats = await Promise.all(filePromises)

  for (const stats of fileStats) {
    totals.activeBytes += stats.activeBytes
    totals.physicalBytes += stats.physicalBytes
    totals.activeFileCount += stats.activeFileCount
    totals.totalFileCount += stats.totalFileCount
  }

  const libraryManifest = await getLibraryManifest(libDirPath)
  libraryManifest.usage = totals
  await saveLibraryManifest(libDirPath, libraryManifest)

  return totals
}

async function reconcileWorkspace(workspaceDirPath: string): Promise<StorageStats> {
  const librariesDir = path.join(workspaceDirPath, 'libraries')
  const libraryIds = await readdir(librariesDir).catch(() => [])

  const totals: StorageStats = {
    activeBytes: 0,
    physicalBytes: 0,
    activeFileCount: 0,
    totalFileCount: 0,
    lastUpdated: new Date().toISOString(),
    lastFullScan: new Date().toISOString(),
    integrityState: 'reconciled',
  }

  for (const libId of libraryIds) {
    const libPath = path.join(librariesDir, libId)
    const stats = await reconcileLibrary(libPath)
    totals.activeBytes += stats.activeBytes
    totals.physicalBytes += stats.physicalBytes
    totals.activeFileCount += stats.activeFileCount
    totals.totalFileCount += stats.totalFileCount
  }

  const manifest = await getWorkspaceManifest(workspaceDirPath)
  await saveWorkspaceManifest(workspaceDirPath, {
    ...manifest,
    usage: totals,
  })

  return totals
}
