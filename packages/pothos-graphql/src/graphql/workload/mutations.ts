import { GraphQLError } from 'graphql'

import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { canAdminWorkspaceOrThrow } from '../workspace'
import { logger } from './common'

builder.mutationField('startProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      processingType: t.arg({ type: 'ProcessType', required: true }),
    },
    nullable: false,
    resolve: async (_root, args, context) => {
      const workspaceId = context.workspaceId
      await canAdminWorkspaceOrThrow(workspaceId, context.session.user.id)
      try {
        await workspace.startProcessing(workspaceId, args.processingType)
        return true
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId, processingType: args.processingType })
        throw new GraphQLError('Failed to start processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('stopProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      processingType: t.arg({ type: 'ProcessType', required: true }),
    },
    nullable: false,
    resolve: async (_root, args, context) => {
      const workspaceId = context.workspaceId
      await canAdminWorkspaceOrThrow(workspaceId, context.session.user.id)
      try {
        await workspace.stopProcessing(workspaceId, args.processingType)
        return true
      } catch (error) {
        logger.error('Error stopping processing', { error, workspaceId, processingType: args.processingType })
        throw new GraphQLError('Failed to stop processing', { originalError: error as Error })
      }
    },
  }),
)
