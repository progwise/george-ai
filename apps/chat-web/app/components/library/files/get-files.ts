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

const getLibraryAllFiles = createServerFn({ method: 'GET' })
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
        query dropAllFiles($libraryId: String!) {
          aiLibraryAllFiles(libraryId: $libraryId) {
            libraryId
            library {
              name
            }
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

export const aiLibraryAllFilesQueryOptions = (params: { libraryId: string }) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, params.libraryId, 'files'],
    queryFn: async () =>
      getLibraryAllFiles({
        data: { libraryId: params.libraryId },
      }),
  })
