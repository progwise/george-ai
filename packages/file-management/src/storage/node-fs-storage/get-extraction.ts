import { ExtractionMetadata } from '../../schemas/extraction-metadata'
import { getExtractionDir } from './directories'
import { exists } from './exists'
import { getExtractionMetadata } from './metadata-files'

export async function getExtraction(
  workspaceId: string,
  args: { libraryId: string; fileId: string; methodId: string },
): Promise<ExtractionMetadata | null> {
  const { libraryId, fileId, methodId } = args
  if (!(await exists(workspaceId, { libraryId, fileId, methodId }))) {
    return null
  }
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, methodId)
  const extractionMetadata = await getExtractionMetadata(extractionDir)
  if (!extractionMetadata) {
    throw new Error(
      `Extraction metadata not found for methodId: ${methodId} in fileId: ${fileId}, libraryId: ${libraryId}, workspaceId: ${workspaceId}`,
    )
  }
  return extractionMetadata
}
