import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const apiKeysQueryDocument = graphql(`
  query GetApiKeys($libraryId: String!) {
    apiKeys(libraryId: $libraryId) {
      id
      name
      createdAt
      lastUsedAt
      libraryId
    }
  }
`)

const getApiKeys = createServerFn({ method: 'GET' })
  .inputValidator(({ libraryId }: { libraryId: string }) => ({
    libraryId: z.string().nonempty().parse(libraryId),
  }))
  .handler(async (ctx) => {
    const { apiKeys } = await backendRequest(apiKeysQueryDocument, {
      libraryId: ctx.data.libraryId,
    })
    return apiKeys
  })

export const getApiKeysQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: ['apiKeys', libraryId],
    queryFn: () => getApiKeys({ data: { libraryId } }),
  })
