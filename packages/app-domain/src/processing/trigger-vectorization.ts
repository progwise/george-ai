import { ExtractionMethod } from '@george-ai/app-schema'
import { publish } from '@george-ai/event-service-client'
import { DocumentVectorizationRequest } from '@george-ai/event-service-client/src/action/schema'
import { DocumentManifest, getWorkspaceSettings } from '@george-ai/file-management'

import { logger } from '../common'

export async function triggerVectorization(params: {
  documentManifest: DocumentManifest
  extractionMethod?: ExtractionMethod | null
}): Promise<void> {
  const { documentManifest, extractionMethod } = params
  const { workspaceId, libraryId, documentId } = documentManifest

  const workspaceSettings = await getWorkspaceSettings(documentManifest.workspaceId)

  if (!workspaceSettings) {
    logger.error('Can not get workspace settings to read vectorization settings', { ...params })
    throw new Error('Cannot read workspace settings to obtain vectorization settings')
  }

  const { modelDriver: embeddingDriver, modelName: embeddingModel } = workspaceSettings.embedding || {}

  if (!embeddingDriver || !embeddingModel) {
    logger.error('Cannot read embedding settings for document vectorization', { ...params, workspaceSettings })
    throw new Error('Cannot get workspace settings for vectorization')
  }
  const validExtractionMethods = documentManifest.extractions
    .filter((extraction) => extraction.sourceHash === documentManifest.sourceHash)
    .map((extraction) => extraction.extractionMethod)

  if (extractionMethod && !validExtractionMethods.some((method) => extractionMethod == method)) {
    logger.warn('Requested vectorization of outdated or non-existing extraction - skipping', { ...params })
  }
  const extractionMethods = extractionMethod ? [extractionMethod] : validExtractionMethods

  const requests: DocumentVectorizationRequest[] = extractionMethods.map((extractionMethod) => ({
    version: 1,
    workspaceId,
    libraryId,
    documentId,
    action: 'documentVectorization',
    verb: 'request',
    timestamp: new Date(),
    extractionMethod,
    embeddingDriver,
    embeddingModel,
    splitMethod: 'standard',
  }))

  await Promise.all(requests.map((request) => publish(request)))
}
