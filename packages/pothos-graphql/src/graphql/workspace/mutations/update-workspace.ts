import { canWriteWorkspaceOrThrow, updateWorkspace } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('updateWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'WorkspaceManifest',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      name: t.arg.string({ required: false }),
      settings: t.arg({
        required: false,
        type: builder.inputType('WorkspaceSettingsInput', {
          fields: (t) => ({
            storageLimitFiles: t.int({ required: false }),
            storageLimitBytes: t.float({ required: false }),
            embedding: t.field({
              required: false,
              type: builder.inputType('EmbeddingSettingsInput', {
                fields: (t) => ({
                  modelDriver: t.field({ type: 'InferenceDriver', required: true }),
                  modelName: t.string({ required: true }),
                }),
              }),
            }),
            vision: t.field({
              required: false,
              type: builder.inputType('VisionSettingsInput', {
                fields: (t) => ({
                  modelDriver: t.field({ type: 'InferenceDriver', required: true }),
                  modelName: t.string({ required: true }),
                }),
              }),
            }),
          }),
        }),
      }),
    },
    resolve: async (_, { workspaceId, name, settings }, { session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const updatedManifest = await updateWorkspace({ workspaceId, name, settings })
      logger.debug('Workspace updated', { workspaceId, updatedManifest })
      return updatedManifest
    },
  }),
)
