import { GraphQLError } from 'graphql'

import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { canWriteWorkspaceOrThrow } from '../workspace'
import { logger } from './common'
import { EmbeddingRequestInput } from './types'

builder.mutationField('startEventProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      processType: t.arg({ type: 'ProcessType', required: true }),
    },
    nullable: false,
    resolve: async (_parent, { processType }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspace.startProcessing(workspaceId, processType)
        return true
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId, processType })
        throw new GraphQLError('Failed to start processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('stopEventProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      processType: t.arg({ type: 'ProcessType', required: true }),
    },
    resolve: async (_parent, { processType }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspace.stopProcessing(workspaceId, processType)
        return true
      } catch (error) {
        logger.error('Error stopping processing', { error, workspaceId, processType })
        throw new GraphQLError('Failed to stop processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('triggerEmbeddingEvent', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TriggerEmbeddingEventResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
      }),
    }),
    args: {
      input: t.arg({ type: EmbeddingRequestInput, required: true }),
    },
    nullable: false,
    resolve: async (_parent, { input }, { workspaceId, session }) => {
      // Check if user has access to this library
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      await workspace.triggerEmbeddingEvent({ workspaceId, ...input })
      return { success: true }
    },
  }),
)
