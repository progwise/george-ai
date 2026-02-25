import { ExtractionMethod } from '@george-ai/app-commons'
import { ExtractionManifest, extraction } from '@george-ai/file-management'

export async function getExtraction(
  workspaceId: string,
  parameters: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod },
): Promise<ExtractionManifest | null> {
  const metadata = await extraction.get(workspaceId, { ...parameters })
  if (!metadata) {
    return null
  }
  return metadata
}
