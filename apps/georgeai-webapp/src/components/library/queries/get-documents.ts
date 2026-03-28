import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getDocuments = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
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
    const result = await backendRequest(
      graphql(`
        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {
          documents(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {
            totalCount
            archivedCount
            items {
              manifest {
                version
              }
              ...AiLibraryFile_FilesTable
            }
          }
        }
      `),
      { ...ctx.data },
    )
    return result.documents
  })

export const getDocumentsQueryOptions = (params: {
  libraryId: string
  skip: number
  take: number
  showArchived?: boolean
}) =>
  queryOptions({
    queryKey: ['AiLibraryFiles', { ...params }],
    queryFn: async () =>
      getDocuments({
        data: {
          libraryId: params.libraryId,
          skip: params.skip,
          take: params.take,
          showArchived: params.showArchived ?? false,
        },
      }),
  })
