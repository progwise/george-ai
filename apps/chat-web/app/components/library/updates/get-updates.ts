import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getLibraryUpdateItems = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        crawlerId: z.string().nullish(),
        take: z.number().nullish(),
        skip: z.number().nullish(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        query libraryUpdatesList($libraryId: ID!, $crawlerId: ID, $take: Int, $skip: Int) {
          aiLibraryUpdates(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {
            libraryId
            crawlerId
            take
            skip
            count
            updates {
              ...AiLibraryUpdate_TableItem
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const getLibraryUpdateItemsQueryOptions = (props: {
  libraryId: string
  crawlerId?: string
  take?: number
  skip?: number
}) => {
  const { libraryId, crawlerId, take = 10, skip = 0 } = props
  return queryOptions({
    queryKey: [queryKeys.AiLibraries, libraryId, crawlerId, take, skip, 'updates'],
    queryFn: () => getLibraryUpdateItems({ data: { libraryId, crawlerId, take, skip } }),
  })
}
