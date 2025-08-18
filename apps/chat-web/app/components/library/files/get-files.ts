import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
        showArchived: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {
          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {
            libraryId
            library {
              name
            }
            take
            skip
            showArchived
            count
            archivedCount
            files {
              ...AiLibraryFile_TableItem
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const aiLibraryFilesQueryOptions = (params: {
  libraryId: string
  skip: number
  take: number
  showArchived?: boolean
}) =>
  queryOptions({
    queryKey: ['AiLibraryFiles', { ...params }],
    queryFn: async () =>
      getLibraryFiles({
        data: {
          libraryId: params.libraryId,
          skip: params.skip,
          take: params.take,
          showArchived: params.showArchived ?? false,
        },
      }),
  })
