import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment AiLibraryDetail on AiLibrary {
    ...AiLibraryBase
    ownerId
    filesCount
    description
  }
`)

const aiLibraryDetailQueryDocument = graphql(`
  query aiLibraryDetail($id: String!) {
    aiLibrary(id: $id) {
      ...AiLibraryDetail
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => ({
    id: z.string().nonempty().parse(libraryId),
  }))
  .handler(async (ctx) => await backendRequest(aiLibraryDetailQueryDocument, ctx.data))

export const getLibraryQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, libraryId],
    queryFn: async () => getLibrary({ data: { libraryId } }),
    select: (data) => {
      if (!data.aiLibrary) {
        throw Error('Library not found')
      }

      return data.aiLibrary
    },
  })
