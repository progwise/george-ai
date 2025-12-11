import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getEnrichmentsStatistics = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getEnrichmentsStatistics($listId: String!) {
          aiListEnrichmentsStatistics(listId: $listId) {
            fieldId
            fieldName
            itemCount
            cacheCount
            valuesCount
            missingCount
            completedTasksCount
            errorTasksCount
            failedTasksCount
            pendingTasksCount
            processingTasksCount
          }
        }
      `),
      {
        listId: ctx.data,
      },
    ),
  )

export const getEnrichmentsStatisticsQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ['AiListEnrichmentsStatistics', { listId }],
    queryFn: () => getEnrichmentsStatistics({ data: listId }),
    refetchInterval: (query) => {
      // Check if there are active enrichments in the current data
      const data = query.state.data
      const hasActiveEnrichments =
        data?.aiListEnrichmentsStatistics.some((s) => s.pendingTasksCount > 0 || s.processingTasksCount > 0) || false
      return hasActiveEnrichments ? 2000 : false // Poll every 2 seconds if enrichments are active
    },
  })
