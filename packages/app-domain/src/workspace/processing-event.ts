import { workspaceProcessing } from '@george-ai/event-service-client'

export type {
  ProcessEvent,
  EmbeddingRequest,
  ExtractionRequest,
  EnrichmentRequest,
} from '@george-ai/event-service-client'

export async function triggerEmbeddingEvent({
  workspaceId,
  libraryId,
  fileId,
  fileFragmentIndex,
  extractionMethod,
}: {
  workspaceId: string
  libraryId: string
  fileId: string
  fileFragmentIndex?: number | null
  extractionMethod?: string | null
}) {
  workspaceProcessing.publishRequestEvent({
    version: 1,
    workspaceId,
    processType: 'embedding',
    libraryId,
    fileId,
    fileFragmentIndex,
    extractionMethod,
  })
}
