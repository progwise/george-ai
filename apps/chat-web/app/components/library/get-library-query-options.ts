import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryDetailsQueryDocument = graphql(`
  query aiLibraryDetails($id: String!) {
    aiLibrary(id: $id) {
      id
      name
      ...LibraryFormFragment
      ...DeleteLibraryDialog_Library
      ...LibraryParticipants_Library
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => ({
    libraryId: z.string().nonempty().parse(libraryId),
  }))
  .handler(async (ctx) => {
    const { aiLibrary } = await backendRequest(aiLibraryDetailsQueryDocument, {
      id: ctx.data.libraryId,
    })
    if (!aiLibrary) {
      throw notFound()
    }
    return aiLibrary
  })

export const getLibraryQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibrary, libraryId],
    queryFn: () => getLibrary({ data: { libraryId } }),
  })
