import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryDetailsQueryDocument = graphql(`
  query aiLibraryDetails($id: String!) {
    aiLibrary(id: $id) {
      id
      ...LibraryFormFragment
      ...DeleteLibraryDialog_Library
      ...LibrarySelector_Library
      ...LibraryParticipants_Library
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId, userId }: { libraryId: string; userId: string }) => ({
    libraryId: z.string().nonempty().parse(libraryId),
    userId: z.string().nonempty().parse(userId),
  }))
  .handler(
    async (ctx) =>
      await backendRequest(aiLibraryDetailsQueryDocument, {
        id: ctx.data.libraryId,
        userId: ctx.data.userId,
      }),
  )

export const getLibraryQueryOptions = (libraryId: string, userId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibrary, libraryId, userId],
    queryFn: () => getLibrary({ data: { libraryId, userId } }),
  })
