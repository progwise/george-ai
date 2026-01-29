import { workspaceStorage } from '@george-ai/file-management'
import { compareDates } from '@george-ai/web-utils'

import { logger } from './common'

export const getLatestExtractions = async ({
  workspaceId,
  libraryId,
  fileId,
}: {
  workspaceId: string
  libraryId: string
  fileId: string
}) => {
  const file = await workspaceStorage.getFile(workspaceId, { libraryId, fileId })

  if (!file) {
    logger.error('File not found when getting latest extraction markdown file names', {
      fileId,
      libraryId,
      workspaceId,
    })
    throw new Error(`File ${fileId} in library ${libraryId} does not exist in workspace ${workspaceId}`)
  }

  if (file.extractions.length === 0) {
    return []
  }

  const sortedExtractions = file.extractions.sort((a, b) => compareDates(b.extractionDate, a.extractionDate))
  return sortedExtractions.map((extraction) => extraction.extractionMethod)
}
