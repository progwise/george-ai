import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { InferenceDriverSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const testProviderConnectionMutationDocument = graphql(`
  mutation TestProviderConnection($providerId: String, $driver: InferenceDriver!, $baseUrl: String, $apiKey: String) {
    testProviderConnection(providerId: $providerId, driver: $driver, baseUrl: $baseUrl, apiKey: $apiKey) {
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
        provider: InferenceDriverSchema,
        baseUrl: z.string().optional(),
        apiKey: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(testProviderConnectionMutationDocument, data)
    return result.testProviderConnection
  })
