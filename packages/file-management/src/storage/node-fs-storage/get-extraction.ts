import { ExtractionMetadata } from '../../schemas/extraction-metadata'
import { getExtractionDir } from './directories'
import { exists } from './exists'
import { getExtractionMetadata } from './metadata-files'

export async function getExtraction(
  workspaceId: string,
  args: { libraryId: string; fileId: string; extractionMethod: string },
): Promise<ExtractionMetadata | null> {
  const { libraryId, fileId, extractionMethod } = args
  if (!(await exists(workspaceId, { libraryId, fileId, extractionMethod }))) {
    return null
  }
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, extractionMethod)
  const extractionMetadata = await getExtractionMetadata(extractionDir)
  if (!extractionMetadata) {
    throw new Error(
      `Extraction metadata not found for methodId: ${extractionMethod} in fileId: ${fileId}, libraryId: ${libraryId}, workspaceId: ${workspaceId}`,
    )
  }
  return extractionMetadata
}
