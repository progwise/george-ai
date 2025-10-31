import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const getCrawlers = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        query CrawlerTable($libraryId: String!) {
          aiLibrary(libraryId: $libraryId) {
            crawlers {
              ...Crawlers_CrawlersMenu
            }
          }
        }
      `),
      { libraryId: ctx.data },
    )
  })

export const getCrawlersQueryOptions = ({ libraryId }: { libraryId: string }) =>
  queryOptions({
    queryKey: ['getCrawlers', { libraryId }],
    queryFn: () => getCrawlers({ data: libraryId }),
    refetchInterval: (query) => {
      const lastData = query.state.data
      const runningCrawlers = lastData?.aiLibrary.crawlers.filter((crawler) => crawler.isRunning)
      return runningCrawlers && runningCrawlers.length > 0 ? 10000 : 100000
    },
  })
