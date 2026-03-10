import z from 'zod'

import { getErrorMessage } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { ACTION_STREAM_NAME, logger } from './common'
import { getConsumerGlobPattern } from './consumer'
import {
  DocumentExtractionEvent,
  DocumentExtractionEventSchema,
  DocumentVectorizationEvent,
  DocumentVectorizationEventSchema,
  FieldEnrichmentEvent,
  FieldEnrichmentEventSchema,
} from './schema'

export const subscribeDocumentExtraction = async (parameters: {
  handler: (params: { event: DocumentExtractionEvent }) => Promise<void>
}) => {
  const { handler } = parameters
  logger.info('Subscribing to document extraction events', {
    parameters,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action: 'documentExtraction' }),
  })
  const unsubscribe = await eventClient.startWorkerLoop({
    schema: DocumentExtractionEventSchema,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action: 'documentExtraction' }),
    handler: async ({ subject, event }) => {
      logger.debug('documentExtraction event received', { subject, event })
      try {
        return await handler({ event })
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

export const subscribeDocumentVectorization = async (parameters: {
  handler: (params: { event: DocumentVectorizationEvent }) => Promise<void>
}) => {
  const { handler } = parameters
  const unsubscribe = await eventClient.startWorkerLoop({
    schema: DocumentVectorizationEventSchema,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action: 'documentVectorization' }),
    handler: async ({ subject, event }) => {
      logger.debug('Action event received', { subject, event })
      try {
        return await handler({ event })
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

export const subscribeFieldEnrichment = async (parameters: {
  handler: (params: { event: FieldEnrichmentEvent }) => Promise<void>
}) => {
  const { handler } = parameters
  const unsubscribe = await eventClient.startWorkerLoop({
    schema: FieldEnrichmentEventSchema,
    streamName: ACTION_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ action: 'fieldEnrichment' }),
    handler: async ({ subject, event }) => {
      logger.debug('Action event received', { subject, event })
      try {
        return await handler({ event })
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
