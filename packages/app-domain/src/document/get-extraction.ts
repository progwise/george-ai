import { ExtractionMethod } from '@george-ai/app-commons'
import { ExtractionManifest, extraction } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function getExtraction(
  workspaceId: string,
  parameters: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod },
): Promise<ExtractionManifest> {
  const metadata = await extraction.get(workspaceId, { ...parameters })
  if (!metadata) {
    throw new DomainError('Extraction not found', 'document')
  }
  return metadata
}
