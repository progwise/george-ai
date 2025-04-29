import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryEditQueryDocument = graphql(`
  query aiLibraryEdit($id: String!) {
    aiLibrary(id: $id) {
      id
      name
      ...LibraryFormFragment
      ...DeleteLibraryDialog_Library
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => ({
    id: z.string().nonempty().parse(libraryId),
  }))
  .handler(async (ctx) => await backendRequest(aiLibraryEditQueryDocument, ctx.data))

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
