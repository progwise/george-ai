import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const getCrawlerRuns = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        crawlerId: z.string().optional(),
        skip: z.number(),
        take: z.number(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query GetCrawlerRuns($libraryId: String!, $crawlerId: String, $skip: Int!, $take: Int!) {
          aiLibraryCrawlerRuns(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {
            count
            runs {
              id
              crawlerId
              crawler {
                id
                uri
                uriType
              }
              startedAt
              endedAt
              success
              ...CrawlerRuns_CrawlerRunsTable
            }
          }
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        crawlerId: ctx.data.crawlerId,
        skip: ctx.data.skip,
        take: ctx.data.take,
      },
    )
    return result.aiLibraryCrawlerRuns
  })

export const getCrawlerRunsQueryOptions = ({
  libraryId,
  crawlerId,
  skip,
  take,
}: {
  libraryId: string
  crawlerId?: string
  skip: number
  take: number
}) =>
  queryOptions({
    queryKey: ['getCrawlerRuns', { libraryId, crawlerId }, { skip, take }],
    queryFn: () => getCrawlerRuns({ data: { libraryId, crawlerId, skip, take } }),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 0
      return data.runs.some((run) => !run.endedAt) ? 3000 : 0
    },
  })
