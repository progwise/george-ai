import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { MODEL_PROVIDERS } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const testProviderConnectionMutationDocument = graphql(`
  mutation TestProviderConnection($providerId: String, $provider: ModelProvider!, $baseUrl: String, $apiKey: String) {
    testProviderConnection(providerId: $providerId, provider: $provider, baseUrl: $baseUrl, apiKey: $apiKey) {
      success
      isOnline
      isHealthy
      message
    }
  }
`)

export const testProviderConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        providerId: z.string().optional(),
        provider: z.enum(MODEL_PROVIDERS).or(z.string()),
        baseUrl: z.string().optional(),
        apiKey: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(testProviderConnectionMutationDocument, data)
    return result.testProviderConnection
  })
