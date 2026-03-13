import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getFileChunks = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
        fragment: z.number().int().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileChunks(
          $libraryId: String!
          $fileId: String!
          $skip: Int
          $take: Int
          $extractionMethod: ExtractionMethod
          $fragment: Int
        ) {
          fileChunks(
            libraryId: $libraryId
            fileId: $fileId
            skip: $skip
            take: $take
            extractionMethod: $extractionMethod
            fragment: $fragment
          ) {
            totalCount
            chunks {
              id
              libraryId
              fileId
              chunk
              content
              fileName
              extractionMethod
              embeddingModelNames
              fragment
            }
          }
        }
      `),
      { ...data },
    )
    return result.fileChunks || { totalCount: undefined }
  })

export const getFileChunksQueryOptions = (parameters: {
  libraryId: string
  fileId: string
  skip?: number
  take?: number
  fragment?: number
}) => ({
  queryKey: [queryKeys.FileChunks, parameters],
  queryFn: () =>
    getFileChunks({
      data: parameters,
    }),
})
