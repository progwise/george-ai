import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const queryLibraryFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        query: z.string().default('*'),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        query queryLibraryFiles($libraryId: String!, $query: String!, $skip: Int!, $take: Int!) {
          queryAiLibraryFiles(libraryId: $libraryId, query: $query, skip: $skip, take: $take) {
            libraryId
            query
            take
            skip
            hitCount
            hits {
              pageContent
              docName
              docId
              id
              docPath
              originUri
              highlights {
                field
                snippet
              }
            }
          }
        }
      `),
      { ...ctx.data },
    ),
  )

export const getQueryLibraryFilesQueryOptions = (params: {
  libraryId: string
  query: string
  skip: number
  take: number
}) => ({
  queryKey: ['queryFiles', params.libraryId, params.query, params.skip, params.take],
  queryFn: async () => {
    return await queryLibraryFiles({
      data: {
        libraryId: params.libraryId,
        query: params.query,
        skip: params.skip,
        take: params.take,
      },
    })
  },
})
