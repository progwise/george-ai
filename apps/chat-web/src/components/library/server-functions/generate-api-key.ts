import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const generateApiKeyMutationDocument = graphql(`
  mutation GenerateApiKey($libraryId: String!, $name: String!) {
    generateApiKey(libraryId: $libraryId, name: $name) {
      id
      name
      key
      libraryId
      createdAt
    }
  }
`)

export const generateApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(({ libraryId, name }: { libraryId: string; name: string }) => ({
    libraryId: z.string().nonempty().parse(libraryId),
    name: z.string().min(1).max(100).parse(name),
  }))
  .handler(async (ctx) => {
    const result = await backendRequest(generateApiKeyMutationDocument, {
      libraryId: ctx.data.libraryId,
      name: ctx.data.name,
    })
    return result.generateApiKey
  })
