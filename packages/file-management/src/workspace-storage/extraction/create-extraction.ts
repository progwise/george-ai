import { ExtractionMethod } from '@george-ai/app-commons'

import { logger } from '../commons'
import { DocumentManifest, ExtractionManifest, StorageStatsSchema } from '../schema'
import { ExtractionWriter, createExtractionWriter } from './extraction.writer'

export async function createExtraction(
  documentManifest: DocumentManifest,
  extractionMethod: ExtractionMethod,
): Promise<ExtractionWriter> {
  const { workspaceId, libraryId, documentId, sourceHash } = documentManifest

  if (!sourceHash) {
    logger.error('Source hash is missing in file manifest, cannot create extraction', { documentManifest })
    throw new Error('Source hash is required to create an extraction')
  }

  const extractionManifest: ExtractionManifest = {
    workspaceId,
    libraryId,
    documentId,
    extractionMethod,
    sourceHash,
    version: 1,
    storageStats: StorageStatsSchema.parse({}),
    attachments: [],
    created: new Date(),
    type: 'extraction',
  }

  return createExtractionWriter(extractionManifest)
}
