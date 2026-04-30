import { getErrorMessage } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { ACTION_STREAM_NAME, logger } from './common'
import {
  AnalyzeImageEvent,
  AnalyzeImageEventSchema,
  AsyncAction,
  DocumentExtractionEvent,
  DocumentExtractionEventSchema,
  DocumentVectorizationEvent,
  DocumentVectorizationEventSchema,
  FieldEnrichmentEvent,
  FieldEnrichmentEventSchema,
  MigrateFileEvent,
  MigrateFileEventSchema,
} from './schema'
import { getAsyncSubjectFilters } from './subject'

export const subscribe = async <T extends AsyncAction>(parameters: {
  action: T
  handler: (params: {
    event: T extends 'documentExtraction'
      ? DocumentExtractionEvent
      : T extends 'documentVectorization'
        ? DocumentVectorizationEvent
        : T extends 'fieldEnrichment'
          ? FieldEnrichmentEvent
          : T extends 'analyzeImage'
            ? AnalyzeImageEvent
            : MigrateFileEvent
  }) => Promise<void>
}) => {
  const { handler, action } = parameters
  logger.info(`Subscribing to streaming events`, {
    parameters,
    streamName: ACTION_STREAM_NAME,
  })
  const unsubscribe = await eventClient.startWorkerLoop({
    schema:
      action === 'documentExtraction'
        ? DocumentExtractionEventSchema
        : action === 'documentVectorization'
          ? DocumentVectorizationEventSchema
          : action === 'fieldEnrichment'
            ? FieldEnrichmentEventSchema
            : action === 'analyzeImage'
              ? AnalyzeImageEventSchema
              : MigrateFileEventSchema,
    streamName: ACTION_STREAM_NAME,
    subjectFilters: getAsyncSubjectFilters({ action }),
    handler: async ({ subject, event }) => {
      logger.info(`${action} event received`, { subject, event })
      try {
        return await handler({ event } as Parameters<typeof handler>[0])
      } catch (error) {
        const message = getErrorMessage(error)
        logger.error('Transient error: handler failed', { subject, message })
        throw error // NACK - let NATS retry based on consumer policy
      }
    },
  })

  return unsubscribe
}
