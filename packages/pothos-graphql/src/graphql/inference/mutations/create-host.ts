import { canAdminWorkspaceOrThrow, createInferenceHost } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('createInferenceHost', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceHostConfig',
    nullable: false,
    args: {
      driver: t.arg({ type: 'InferenceDriver', required: true }),
      data: t.arg({ type: 'InferenceHostInput', required: true }),
    },
    resolve: async (_source, { driver, data }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      try {
        const config = await createInferenceHost({
          workspaceId,
          driver: driver,
          baseUrl: data.baseUrl ?? undefined,
          apiKey: data.apiKey ?? undefined,
          name: data.name,
          configuredVramGb: data.vramGb ?? undefined,
        })

        return config
      } catch (error) {
        logger.error('Error creating inference host', { error, workspaceId, driver, data })
        throw error instanceof Error ? error : new Error('Unknown error creating inference host')
      }
    },
  }),
)
