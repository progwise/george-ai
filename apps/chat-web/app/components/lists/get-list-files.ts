import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getListFilesSchema = z.object({
  listId: z.string().nonempty(),
  skip: z.number().min(0).optional().default(0),
  take: z.number().min(1).max(100).optional().default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
})

const listFilesDocument = graphql(`
  query aiListFiles($listId: String!, $skip: Int!, $take: Int!, $orderBy: String, $orderDirection: String) {
    aiListFiles(listId: $listId, skip: $skip, take: $take, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...ListFilesTable_FilesQueryResult
    }
  }
`)

const getListFiles = createServerFn({ method: 'GET' })
  .validator(
    (data: { listId: string; skip?: number; take?: number; orderBy?: string; orderDirection?: 'asc' | 'desc' }) =>
      getListFilesSchema.parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(listFilesDocument, ctx.data)
  })

export const getListFilesQueryOptions = (params: {
  listId: string
  skip?: number
  take?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}) =>
  queryOptions({
    queryKey: ['AiListFiles', params],
    queryFn: () => getListFiles({ data: params }),
  })
