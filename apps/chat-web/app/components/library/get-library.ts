import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
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
  query aiLibraryDetail($libraryId: String!) {
    aiLibrary(libraryId: $libraryId) {
      ...AiLibraryDetail
      ...LibraryUsers_Library
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => ({
    libraryId: z.string().nonempty().parse(libraryId),
  }))
  .handler(async (ctx) => {
    const { aiLibrary } = await backendRequest(aiLibraryDetailQueryDocument, {
      libraryId: ctx.data.libraryId,
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
