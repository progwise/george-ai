import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const aiLibraryDetailQueryDocument = graphql(`
  query aiLibraryDetail($libraryId: String!) {
    library(libraryId: $libraryId) {
      id

      ...AiLibraryBase
      ...AiLibraryForm_Library
      manifest {
        version
        name
      }
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    return z
      .object({
        libraryId: z.string(),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    const { library } = await backendRequest(aiLibraryDetailQueryDocument, data)
    return library
  })

export const getLibraryQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibrary, libraryId],
    queryFn: () => getLibrary({ data: { libraryId } }),
  })
