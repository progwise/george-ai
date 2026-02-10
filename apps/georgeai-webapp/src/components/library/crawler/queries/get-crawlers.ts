import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const getCrawlers = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query CrawlerTable($libraryId: String!) {
          library(libraryId: $libraryId) {
            crawlers {
              ...Crawlers_CrawlersMenu
            }
          }
        }
      `),
      { libraryId: ctx.data },
    )
    return result.library
  })

export const getCrawlersQueryOptions = ({ libraryId }: { libraryId: string }) =>
  queryOptions({
    queryKey: ['getCrawlers', { libraryId }],
    queryFn: () => getCrawlers({ data: libraryId }),
    refetchInterval: (query) => {
      const lastData = query.state.data
      const runningCrawlers = lastData?.crawlers.filter((crawler) => crawler.isRunning)
      return runningCrawlers && runningCrawlers.length > 0 ? 10000 : 100000
    },
  })
