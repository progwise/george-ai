import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const librariesDocument = graphql(`
  query aiLibraries($userId: String!) {
    aiLibraries(userId: $userId) {
      id
      name
      owner {
        id
        name
      }
      createdAt
      updatedAt
      ...LibrarySelector_Library
    }
  }
`)

const getLibraries = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler(async (ctx) => {
    return backendRequest(librariesDocument, { userId: ctx.data })
  })

export const getLibrariesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, userId],
    queryFn: async () => {
      return getLibraries({ data: userId })
    },
  })
