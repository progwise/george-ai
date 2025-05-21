import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

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
  query aiLibraries {
    aiLibraries {
      ...AiLibraryBase
    }
  }
`)

const getLibraries = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(librariesDocument)
})

export const getLibrariesQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries],
    queryFn: async () => {
      return getLibraries()
    },
  })
