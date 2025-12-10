import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const createAutomationSchema = z.object({
  name: z.string().min(1),
  listId: z.string().min(1),
  connectorId: z.string().min(1),
  connectorAction: z.string().optional(), // Optional - uses default if not provided
  actionConfig: z.string().optional(), // Optional - uses default if not provided
  filter: z.string().optional(),
  schedule: z.string().optional(),
  executeOnEnrichment: z.boolean().optional(),
})

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>

export const createAutomationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateAutomationInput) => createAutomationSchema.parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation createAutomation($data: AiAutomationInput!) {
          createAutomation(data: $data) {
            id
            name
          }
        }
      `),
      { data: ctx.data },
    )
  })
