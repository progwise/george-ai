import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const createConnectorSchema = z.object({
  connectorType: z.string().min(1),
  baseUrl: z.string().url(),
  name: z.string().optional(),
  config: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    apiKey: z.string().optional(),
    token: z.string().optional(),
  }),
})

export type CreateConnectorInput = z.infer<typeof createConnectorSchema>

export const createConnectorFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateConnectorInput) => createConnectorSchema.parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation createConnector($data: AiConnectorInput!) {
          createConnector(data: $data) {
            id
            name
            connectorType
            baseUrl
            isConnected
          }
        }
      `),
      { data: ctx.data },
    ),
  )
