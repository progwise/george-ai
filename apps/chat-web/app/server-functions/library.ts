import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

export const dropAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation dropFile($id: String!) {
            dropFile(fileId: $id) {
              id
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(dropFilePromises)
  })

export const reProcessAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reProcessFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation reProcessFile($id: String!) {
            processFile(fileId: $id) {
              id
              chunks
              size
              uploadedAt
              processedAt
              processingErrorMessage
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(reProcessFilePromises)
  })

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator(
    ({
      libraryId,
      sortColumn,
      sortDirection,
      page,
      itemsPerPage,
    }: {
      libraryId: string
      sortColumn: 'index' | 'name' | 'size' | 'chunks' | 'processedAt'
      sortDirection: 'asc' | 'desc'
      page: number
      itemsPerPage: number
    }) => {
      return {
        libraryId: z.string().nonempty().parse(libraryId),
        sortColumn: z.enum(['index', 'name', 'size', 'chunks', 'processedAt']).optional().parse(sortColumn),
        sortDirection: z.enum(['asc', 'desc']).parse(sortDirection),
        page: z.number().parse(page),
        itemsPerPage: z.number().parse(itemsPerPage),
      }
    },
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query EmbeddingsTable(
          $libraryId: String!
          $sortColumn: String!
          $sortDirection: String!
          $page: Int!
          $itemsPerPage: Int!
        ) {
          aiLibraryFiles(
            libraryId: $libraryId
            sortColumn: $sortColumn
            sortDirection: $sortDirection
            page: $page
            itemsPerPage: $itemsPerPage
          ) {
            id
            name
            originUri
            mimeType
            size
            chunks
            uploadedAt
            processedAt
            processingErrorMessage
            dropError
          }
          totalCount: aiLibraryFilesCount(libraryId: $libraryId)
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        sortColumn: ctx.data.sortColumn,
        sortDirection: ctx.data.sortDirection,
        page: ctx.data.page,
        itemsPerPage: ctx.data.itemsPerPage,
      },
    )
  })

export const aiLibraryFilesQueryOptions = (
  libraryId: string,
  sortColumn: 'index' | 'name' | 'size' | 'chunks' | 'processedAt',
  sortDirection: 'asc' | 'desc',
  page: number,
  itemsPerPage: number,
) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraryFiles, libraryId, sortColumn, sortDirection, page, itemsPerPage],
    queryFn: async () => {
      const result = await getLibraryFiles({ data: { libraryId, sortColumn, sortDirection, page, itemsPerPage } })
      return { aiLibraryFiles: result.aiLibraryFiles || [], totalCount: result.totalCount || 0 }
    },
  })
