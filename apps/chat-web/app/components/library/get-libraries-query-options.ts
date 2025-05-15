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
  query aiLibraries($ownerId: String!) {
    aiLibraries(ownerId: $ownerId) {
      ...AiLibraryBase
    }
  }
`)

const getLibraries = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => z.string().nonempty().parse(ownerId))
  .handler(async (ctx) => {
    return backendRequest(librariesDocument, { ownerId: ctx.data })
  })

export const getLibrariesQueryOptions = (ownerId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, ownerId],
    queryFn: async () => {
      return getLibraries({ data: ownerId })
    },
  })
