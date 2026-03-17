import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql/gql'
import { WorkspaceSettingsInputSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

export const UpdateWorkspaceParameterSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(3).optional(),
  settings: WorkspaceSettingsInputSchema().optional(),
})

export const updateWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof UpdateWorkspaceParameterSchema>) => UpdateWorkspaceParameterSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation UpdateWorkspace($workspaceId: ID!, $name: String, $settings: WorkspaceSettingsInput) {
          updateWorkspace(workspaceId: $workspaceId, name: $name, settings: $settings) {
            workspaceId
            name
            settings {
              storageLimitFiles
              storageLimitBytes
              embedding {
                modelDriver
                modelName
              }
              imageAnalysis {
                modelDriver
                modelName
              }
            }
          }
        }
      `),
      data,
    )
    return result.updateWorkspace
  })
