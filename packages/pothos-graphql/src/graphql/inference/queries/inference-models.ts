import { GraphQLError } from 'graphql/error'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getRegistryEntry } from '@george-ai/event-service-client'

import { builder } from '../../builder'

builder.queryField('inferenceModels', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('AvailableWorkspaceInferenceModels', {
      fields: (t) => ({
        count: t.int({ nullable: false }),
        models: t.field({ type: ['InferenceModel'], nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
      limit: t.arg.int({ required: true }),
      search: t.arg.string({ required: false }),
      canDoEmbedding: t.arg.boolean({ required: false }),
      canDoChatCompletion: t.arg.boolean({ required: false }),
      canDoVision: t.arg.boolean({ required: false }),
    },
    resolve: async (_root, args, { session }) => {
      await canReadWorkspaceOrThrow(args.workspaceId, session.user.id)
      const { workspaceId, limit, search, canDoEmbedding, canDoChatCompletion, canDoVision } = args

      const workspace = await getRegistryEntry({ type: 'workspace', workspaceId })

      if (!workspace) {
        throw new GraphQLError('Workspace not found')
      }

      const models = workspace.inferenceModels.filter((model) => {
        if (search && !model.modelName.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        if (canDoEmbedding !== undefined && model.canDoEmbedding !== canDoEmbedding) {
          return false
        }
        if (canDoChatCompletion !== undefined && model.canDoChatCompletion !== canDoChatCompletion) {
          return false
        }
        if (canDoVision !== undefined && model.canDoVision !== canDoVision) {
          return false
        }
        return true
      })
      return { count: models.length, models: models.slice(0, limit) }
    },
  }),
)
