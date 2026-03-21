import { deleteFile, getFilePath, getFileStats } from '../../file-system'
import { logger } from '../commons'
import { getAnalysesFolderPath, getEntryOrThrow } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { updateStats } from '../storage-stats'

export async function deleteAnalysis(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  parameters: {
    analysisFileName: string
  },
): Promise<boolean> {
  const { analysisFileName } = parameters

  const analysesDir = getAnalysesFolderPath(identifier)
  const analysisFilePath = getFilePath(analysesDir, analysisFileName)
  const analysisStats = await getFileStats(analysisFilePath)
  if (!analysisStats) {
    logger.warn('Analyses directory does not exist for entry', {
      ...identifier,
      analysisFileName,
    })
    return false
  }

  const parentManifest = await getEntryOrThrow(identifier)

  parentManifest.analyses = parentManifest.analyses.filter((a) => a.analysisFileName !== analysisFileName)

  await updateStats(parentManifest, {
    stats: {
      ...parentManifest.storageStats,
      analysesFileCount: -1,
      physicalFileCount: -1,
      analysesBytes: -analysisStats.diskSize,
      physicalBytes: -analysisStats.diskSize,
    },
  })

  await deleteFile(analysisFilePath)
  return true
}
