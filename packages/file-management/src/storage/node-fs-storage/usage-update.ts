import { StorageUsage } from '../../schemas'
import { getFileDirFromPath, getLibraryDirFromPath, getWorkspaceDirFromPath } from './commons'
import {
  getFileManifest,
  getLibraryManifest,
  getWorkspaceManifest,
  saveFileManifest,
  saveLibraryManifest,
  saveWorkspaceManifest,
} from './metadata-files'

export function addUsages(summands: StorageUsage[]): StorageUsage {
  return {
    sourceBytes: summands.reduce((acc, usage) => acc + usage.sourceBytes, 0),
    extractedBytes: summands.reduce((acc, usage) => acc + usage.extractedBytes, 0),
    physicalBytes: summands.reduce((acc, usage) => acc + usage.physicalBytes, 0),
    sourceFiles: summands.reduce((acc, usage) => acc + usage.sourceFiles, 0),
    extractionFiles: summands.reduce((acc, usage) => acc + usage.extractionFiles, 0),
    physicalFiles: summands.reduce((acc, usage) => acc + usage.physicalFiles, 0),
    extractions: summands.reduce((acc, usage) => acc + usage.extractions, 0),
    activeExtractions: summands.reduce((acc, usage) => acc + usage.activeExtractions, 0),
    activeExtractedBytes: summands.reduce((acc, usage) => acc + usage.activeExtractedBytes, 0),
    lastUpdate: new Date().toISOString(),
  }
}

export function subtractUsage(minuend: StorageUsage, subtrahend: StorageUsage): StorageUsage {
  return {
    sourceBytes: minuend.sourceBytes - subtrahend.sourceBytes,
    extractedBytes: minuend.extractedBytes - subtrahend.extractedBytes,
    physicalBytes: minuend.physicalBytes - subtrahend.physicalBytes,
    sourceFiles: minuend.sourceFiles - subtrahend.sourceFiles,
    extractionFiles: minuend.extractionFiles - subtrahend.extractionFiles,
    physicalFiles: minuend.physicalFiles - subtrahend.physicalFiles,
    extractions: minuend.extractions - subtrahend.extractions,
    activeExtractions: minuend.activeExtractions - subtrahend.activeExtractions,
    activeExtractedBytes: minuend.activeExtractedBytes - subtrahend.activeExtractedBytes,
    lastUpdate: new Date().toISOString(),
  }
}

export async function workspaceUsageUpdate(
  workspaceDir: string,
  args: { usage: StorageUsage; operation: 'add' | 'subtract' },
) {
  const { usage, operation } = args
  const workspaceManifest = await getWorkspaceManifest(workspaceDir)
  if (!workspaceManifest) {
    throw new Error(`Workspace manifest not found for workspace dir: ${workspaceDir}`)
  }
  await saveWorkspaceManifest(workspaceDir, {
    ...workspaceManifest,
    usage:
      operation !== 'subtract'
        ? addUsages([workspaceManifest.usage, usage])
        : subtractUsage(workspaceManifest.usage, usage),
  })
}

export async function libraryUsageUpdate(
  libraryDir: string,
  args: { usage: StorageUsage; operation: 'add' | 'subtract' },
) {
  const { usage, operation } = args
  const workspaceDir = getWorkspaceDirFromPath(libraryDir)

  await Promise.all([
    getLibraryManifest(libraryDir).then((libraryManifest) =>
      libraryManifest
        ? saveLibraryManifest(libraryDir, {
            ...libraryManifest,
            usage:
              operation !== 'subtract'
                ? addUsages([libraryManifest.usage, usage])
                : subtractUsage(libraryManifest.usage, usage),
          })
        : Promise.reject(new Error(`Library manifest not found for library dir: ${libraryDir}`)),
    ),
    workspaceUsageUpdate(workspaceDir, args),
  ])
}

export async function fileUsageUpdate(path: string, args: { usage: StorageUsage; operation: 'add' | 'subtract' }) {
  const { usage, operation } = args
  const fileDir = getFileDirFromPath(path)
  const libraryDir = getLibraryDirFromPath(fileDir)

  await Promise.all([
    getFileManifest(fileDir).then((fileManifest) =>
      fileManifest
        ? saveFileManifest(fileDir, {
            ...fileManifest,
            usage:
              operation !== 'subtract'
                ? addUsages([fileManifest.usage, usage])
                : subtractUsage(fileManifest.usage, usage),
          })
        : Promise.reject(new Error(`File manifest not found for file dir: ${fileDir}`)),
    ),
    libraryUsageUpdate(libraryDir, args),
  ])
}
