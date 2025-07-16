import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getCrawlerRuns = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        crawlerId: z.string().nonempty(),
        skip: z.number(),
        take: z.number(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query GetCrawlerRuns($libraryId: String!, $crawlerId: String!, $skip: Int!, $take: Int!) {
          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {
            id
            runs(take: $take, skip: $skip) {
              id
              startedAt
              endedAt
              success
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
  })

export const getCrawlerRunsQueryOptions = ({
  libraryId,
  crawlerId,
  skip,
  take,
}: {
  libraryId: string
  crawlerId: string
  skip: number
  take: number
}) => ({
  queryKey: ['getCrawlerRuns', libraryId, crawlerId, skip, take],
  queryFn: () => getCrawlerRuns({ data: { libraryId, crawlerId, skip, take } }),
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 10, // 10 minutes
  retry: false,
})
