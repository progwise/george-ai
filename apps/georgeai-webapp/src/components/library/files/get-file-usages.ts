import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getFileUsages = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileUsages($libraryId: String!, $fileId: String!, $skip: Int!, $take: Int!) {
          aiFileUsages(libraryId: $libraryId, fileId: $fileId, skip: $skip, take: $take) {
            fileId
            fileName
            skip
            take
            count
            usages {
              id
              listId
              listName
              itemName
              extractionIndex
              createdAt
              chunkCount
            }
          }
        }
      `),
      { libraryId: data.libraryId, fileId: data.fileId, skip: data.skip, take: data.take },
    )
    return result
  })

export const getFileUsagesQueryOptions = (params: {
  libraryId: string
  fileId: string
  skip?: number
  take?: number
}) =>
  queryOptions({
    queryKey: [queryKeys.FileUsages, { ...params }],
    queryFn: () =>
      getFileUsages({
        data: { libraryId: params.libraryId, fileId: params.fileId, skip: params.skip ?? 0, take: params.take ?? 20 },
      }),
  })
