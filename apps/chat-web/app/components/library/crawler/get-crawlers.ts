import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getCrawlers = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        query CrawlerTable($libraryId: String!) {
          aiLibrary(id: $libraryId) {
            ...CrawlerTable_Library
          }
        }
      `),
      { libraryId: ctx.data },
    )
  })

export const getCrawlersQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, libraryId, 'crawlers'],
    queryFn: () => getCrawlers({ data: libraryId }),
  })
