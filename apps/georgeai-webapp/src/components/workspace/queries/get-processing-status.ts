import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetEventQueueParametersSchema = z.object({ workspaceId: z.string().min(3) })

const getEventProcessingStatus = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetEventQueueParametersSchema>) => data)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getEventQueue($workspaceId: String!) {
          eventQueueStats(workspaceId: $workspaceId) {
            action
            status
            error
            pending
            delivered
            redelivered
            waiting
          }
        }
      `),
      data,
    )
    return result.eventQueueStats
  })

export const getEventProcessingStatusQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatus, parameters],
    queryFn: () =>
      !parameters.workspaceId
        ? []
        : getEventProcessingStatus({ data: GetEventQueueParametersSchema.parse(parameters) }),
    enabled: !!parameters.workspaceId,
  })
