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
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query GetCrawlerRun($libraryId: String!, $crawlerRunId: String!, $skipUpdates: Int!, $takeUpdates: Int!) {
          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {
            id
            startedAt
            endedAt
            success
            errorMessage
            runByUserId
            updatesCount
            updates(take: $takeUpdates, skip: $skipUpdates) {
              id
              success
              createdAt
              message
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
      },
    )
  })

export const getCrawlerRunQueryOptions = ({
  libraryId,
  crawlerRunId,
  skipUpdates,
  takeUpdates,
}: {
  libraryId: string
  crawlerRunId: string
  skipUpdates: number
  takeUpdates: number
}) => ({
  queryKey: ['getCrawlerRun', libraryId, crawlerRunId, skipUpdates, takeUpdates],
  queryFn: () => getCrawlerRun({ data: { libraryId, crawlerRunId, skipUpdates, takeUpdates } }),
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 10, // 10 minutes
  retry: false,
})
