import { ExtractionMethod } from '@george-ai/app-commons'

import { getEntry } from '../entry'
import { ExtractionManifest } from '../schema'

export async function getExtraction(
  workspaceId: string,
  parameters: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod },
): Promise<ExtractionManifest | null> {
  const manifest = await getEntry({ ...parameters, workspaceId, type: 'extraction', version: 1 })
  return manifest
}
