import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20) {
          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take) {
            libraryId
            library {
              name
            }
            take
            skip
            count
            files {
              ...AiLibraryFile_TableItem
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const aiLibraryFilesQueryOptions = (params: { libraryId: string; skip: number; take: number }) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, params.libraryId, params.skip, params.take, 'files'],
    queryFn: async () =>
      getLibraryFiles({
        data: { libraryId: params.libraryId, skip: params.skip, take: params.take },
      }),
  })

const getUnprocessedFiles = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query aiLibraryUnprocessed($libraryId: String!) {
          aiLibraryUnprocessedFiles(libraryId: $libraryId) {
            libraryId
            count
            files {
              id
              status
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const aiLibraryUnprocessed = (params: { libraryId: string }) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraryFiles, params.libraryId, 'files'],
    queryFn: async () =>
      getUnprocessedFiles({
        data: { libraryId: params.libraryId },
      }),
  })
