import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment AiLibraryBase on AiLibrary {
    id
    name
    createdAt
    updatedAt
    owner {
      name
    }
  }
`)

const librariesDocument = graphql(`
  query aiLibraries($userId: String!) {
    aiLibraries(userId: $userId) {
      ...AiLibraryBase
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
