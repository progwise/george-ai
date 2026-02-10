import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AiLibraryBase on AiLibrary {
    id
    name
    createdAt
    updatedAt
  }
`)

const librariesDocument = graphql(`
  query aiLibraries {
    libraries {
      totalCount
      items {
        id
        name
        createdAt
        updatedAt
        ...AiLibraryBase
      }
    }
  }
`)

const getLibraries = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(librariesDocument)
  return result.libraries
})

export const getLibrariesQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries],
    queryFn: () => getLibraries(),
  })
