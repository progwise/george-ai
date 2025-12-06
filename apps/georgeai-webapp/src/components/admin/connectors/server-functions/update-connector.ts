import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const updateConnectorSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    connectorType: z.string().min(1),
    baseUrl: z.string().url(),
    name: z.string().optional(),
    config: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      apiKey: z.string().optional(),
      token: z.string().optional(),
    }),
  }),
})

export type UpdateConnectorInput = z.infer<typeof updateConnectorSchema>

export const updateConnectorFn = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateConnectorInput) => updateConnectorSchema.parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation updateConnector($id: ID!, $data: AiConnectorInput!) {
          updateConnector(id: $id, data: $data) {
            id
            name
            connectorType
            baseUrl
            isConnected
          }
        }
      `),
      { id: ctx.data.id, data: ctx.data.data },
    ),
  )
