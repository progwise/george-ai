import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getCrawler = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        crawlerId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query GetCrawler($libraryId: String!, $crawlerId: String!) {
          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {
            ...CrawlerForm_Crawler
            id
            libraryId
            uri
            uriType
            isRunning
            lastRun {
              id
              startedAt
              endedAt
              success
              errorMessage
            }
            filesCount
            runCount
            maxDepth
            maxPages
            cronJob {
              id
              active
              hour
              minute
              monday
              tuesday
              wednesday
              thursday
              friday
              saturday
              sunday
            }
          }
        }
      `),
      { libraryId: ctx.data.libraryId, crawlerId: ctx.data.crawlerId },
    )
  })

export const getCrawlerQueryOptions = ({ libraryId, crawlerId }: { libraryId: string; crawlerId: string }) => ({
  queryKey: ['getCrawler', { libraryId, crawlerId }],
  queryFn: () => getCrawler({ data: { libraryId, crawlerId } }),
})
