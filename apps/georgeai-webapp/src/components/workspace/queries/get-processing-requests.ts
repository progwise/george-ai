import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { EventQueueAction } from '../../../gql/graphql'
import { EventQueueActionSchema } from '../../../gql/validation'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetEventQueuequestsParametersSchema = z.object({
  workspaceId: z.string().min(3),
  action: EventQueueActionSchema,
  take: z.number().optional(),
  startSequence: z.number().optional(),
})

const getProcessingEventsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetEventQueuequestsParametersSchema>) => data)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getEventQueueRequests(
          $workspaceId: String!
          $action: EventQueueAction!
          $take: Int
          $startSequence: Int
        ) {
          eventQueueRequests(workspaceId: $workspaceId, action: $action, take: $take, startSequence: $startSequence) {
            totalMessages
            lastSequence
            requests {
              workspaceId
              action
              timestamp
              ... on DocumentExtractionRequest {
                extractionMethod
                libraryId
                documentId
              }
              ... on DocumentVectorizationRequest {
                libraryId
                documentId
                splitMethod
                extractionMethod
                embeddingDriver
                embeddingModel
              }
              ... on FieldEnrichmentRequest {
                fieldId
                chatModelDriver
                chatModelName
              }
            }
          }
        }
      `),
      data,
    )
    return result.eventQueueRequests
  })

export const getProcessingRequestsQueryOptions = (parameters: {
  workspaceId?: string | null
  action: EventQueueAction
  take?: number
  startSequence?: number
}) =>
  queryOptions({
    queryKey: [queryKeys.EventQueueRequests, parameters],
    queryFn: () =>
      !parameters.workspaceId
        ? { totalMessages: 0, lastSequence: 0, requests: [] }
        : getProcessingEventsFn({ data: GetEventQueuequestsParametersSchema.parse(parameters) }),
    enabled: !!parameters.workspaceId,
    initialData: { totalMessages: 0, lastSequence: 0, requests: [] },
  })
