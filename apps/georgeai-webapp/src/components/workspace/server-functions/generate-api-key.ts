import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const generateApiKeyMutationDocument = graphql(`
  mutation GenerateApiKey($name: String!) {
    generateApiKey(name: $name) {
      id
      name
      key
      workspaceId
      createdAt
    }
  }
`)

export const generateApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(({ name }: { name: string }) => ({
    name: z.string().min(1).max(100).parse(name),
  }))
  .handler(async (ctx) => {
    const result = await backendRequest(generateApiKeyMutationDocument, {
      name: ctx.data.name,
    })
    return result.generateApiKey
  })
