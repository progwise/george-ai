import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryDetailQueryDocument = graphql(`
  query aiLibraryDetail($libraryId: String!) {
    aiLibrary(libraryId: $libraryId) {
      id
      owner {
        ...User_EntityParticipantsDialog
      }
      participants {
        id
        user {
          ...User_EntityParticipantsDialog
        }
      }
      ...AiLibraryBase
      ...AiLibraryForm_Library
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .inputValidator(({ libraryId }: { libraryId: string }) => ({
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
