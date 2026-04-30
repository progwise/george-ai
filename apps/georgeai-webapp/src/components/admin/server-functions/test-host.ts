import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { InferenceDriverSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const TestInferenceHostConnectionInputSchema = z.object({
  workspaceId: z.string(),
  hostId: z.string().optional(),
  driver: InferenceDriverSchema,
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
})

export const testInferenceHostConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof TestInferenceHostConnectionInputSchema>) =>
    TestInferenceHostConnectionInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation testInferenceHostConnectionFn(
          $workspaceId: String!
          $hostId: String
          $driver: InferenceDriver!
          $baseUrl: String
          $apiKey: String
        ) {
          testInferenceHostConnection(
            workspaceId: $workspaceId
            hostId: $hostId
            driver: $driver
            baseUrl: $baseUrl
            apiKey: $apiKey
          ) {
            success
            isOnline
            isHealthy
            message
          }
        }
      `),
      data,
    )
    return result.testInferenceHostConnection
  })
