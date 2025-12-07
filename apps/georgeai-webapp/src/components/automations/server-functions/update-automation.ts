import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const updateAutomationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  listId: z.string().min(1),
  connectorId: z.string().min(1),
  connectorAction: z.string().min(1),
  actionConfig: z.string(), // JSON string
  schedule: z.string().optional(),
  executeOnEnrichment: z.boolean().optional(),
})

export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>

export const updateAutomationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateAutomationInput) => updateAutomationSchema.parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation updateAutomation($id: ID!, $data: AiAutomationInput!) {
          updateAutomation(id: $id, data: $data) {
            id
            name
            connectorAction
            connectorActionConfig {
              values {
                key
                value
              }
              fieldMappings {
                sourceFieldId
                targetField
                transform
              }
            }
          }
        }
      `),
      {
        id: ctx.data.id,
        data: {
          name: ctx.data.name,
          listId: ctx.data.listId,
          connectorId: ctx.data.connectorId,
          connectorAction: ctx.data.connectorAction,
          actionConfig: ctx.data.actionConfig,
          schedule: ctx.data.schedule,
          executeOnEnrichment: ctx.data.executeOnEnrichment,
        },
      },
    )
  })
