import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getCrawlerRun = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        crawlerRunId: z.string().nonempty(),
        skipUpdates: z.coerce.number().default(0),
        takeUpdates: z.coerce.number().default(20),
        updateTypeFilter: z.array(z.string()).optional(),
        successFilter: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query GetCrawlerRun($libraryId: String!, $crawlerRunId: String!, $skipUpdates: Int!, $takeUpdates: Int!, $updateTypeFilter: [String!], $successFilter: Boolean) {
          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {
            id
            startedAt
            endedAt
            success
            stoppedByUser
            errorMessage
            runByUserId
            updatesCount
            filteredUpdatesCount(updateTypeFilter: $updateTypeFilter, successFilter: $successFilter)
            updateStats(successFilter: $successFilter) {
              updateType
              count
            }
            updates(take: $takeUpdates, skip: $skipUpdates, updateTypeFilter: $updateTypeFilter, successFilter: $successFilter) {
              id
              success
              createdAt
              message
              updateType
              filePath
              fileName
              fileSize
              filterType
              filterValue
              file {
                id
                name
                originUri
                mimeType
                size
              }
            }
          }
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        crawlerRunId: ctx.data.crawlerRunId,
        skipUpdates: ctx.data.skipUpdates,
        takeUpdates: ctx.data.takeUpdates,
        updateTypeFilter: ctx.data.updateTypeFilter,
        successFilter: ctx.data.successFilter,
      },
    )
  })

export const getCrawlerRunQueryOptions = ({
  libraryId,
  crawlerRunId,
  skipUpdates,
  takeUpdates,
  updateTypeFilter,
  successFilter,
}: {
  libraryId: string
  crawlerRunId: string
  skipUpdates: number
  takeUpdates: number
  updateTypeFilter?: string[]
  successFilter?: boolean
}) => ({
  queryKey: ['getCrawlerRun', { libraryId, crawlerRunId }, { skipUpdates, takeUpdates, updateTypeFilter, successFilter }],
  queryFn: () => getCrawlerRun({ data: { libraryId, crawlerRunId, skipUpdates, takeUpdates, updateTypeFilter, successFilter } }),
})
