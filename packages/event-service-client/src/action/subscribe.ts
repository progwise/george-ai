import z from 'zod'

import { getErrorMessage } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { ACTION_STREAM_NAME, logger } from './common'
import { getConsumerGlobPattern } from './consumer'
import {
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

export const subscribe = async <T extends AsyncAction>(parameters: {
  action: T
  handler: (params: {
    event: T extends 'documentExtraction'
      ? DocumentExtractionEvent
      : T extends 'documentVectorization'
        ? DocumentVectorizationEvent
        : T extends 'fieldEnrichment'
          ? FieldEnrichmentEvent
          : MigrateFileEvent
  }) => Promise<void>
}) => {
  const { handler, action } = parameters
  logger.info(`Subscribing to streaming events`, {
    parameters,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action: parameters.action }),
  })
  const unsubscribe = await eventClient.startWorkerLoop({
    schema:
      action === 'documentExtraction'
        ? DocumentExtractionEventSchema
        : action === 'documentVectorization'
          ? DocumentVectorizationEventSchema
          : action === 'fieldEnrichment'
            ? FieldEnrichmentEventSchema
            : MigrateFileEventSchema,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action }),
    handler: async ({ subject, event }) => {
      logger.info(`${action} event received`, { subject, event })
      try {
        return await handler({ event } as Parameters<typeof handler>[0])
      } catch (error) {
        // 1. Is it a parsing error? (Poison Pill)
        if (error instanceof SyntaxError || error instanceof z.ZodError) {
          logger.error('Permanent error: malformed payload', { subject, error: error.message })
          return // ACK - stop trying
        }

        // 2. Is it a system/handler error?
        const message = getErrorMessage(error)
        logger.error('Transient error: handler failed', { subject, message })
        throw error // NACK - let NATS retry based on consumer policy
      }
    },
  })

  return unsubscribe
}
