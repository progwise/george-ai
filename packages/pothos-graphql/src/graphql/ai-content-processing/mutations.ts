import { GraphQLError } from 'graphql'

import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../builder'
import { canWriteWorkspaceOrThrow } from '../workspace'
import { logger } from './common'

export const ProcessFileInput = builder.inputType('ProcessFileInput', {
  fields: (t) => ({
    actionType: t.field({ type: 'ActionType', required: true }),
    libraryId: t.string({ required: true }),
    fileId: t.string({ required: true }),
    fragment: t.int({ required: false }),
    extractionMethod: t.field({ type: 'ExtractionMethod', required: false }),
    embeddingModelName: t.string({ required: false }),
    embeddingModelProvider: t.field({ type: 'ModelProvider', required: false }),
  }),
})

builder.mutationField('startEventProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      actionType: t.arg({ type: 'ActionType', required: true }),
    },
    nullable: false,
    resolve: async (_parent, { actionType }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.startProcessing({ workspaceId, actionTypes: [actionType] })
        return true
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId, actionType })
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
      actionType: t.arg({ type: 'ActionType', required: true }),
    },
    resolve: async (_parent, { actionType }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.stopProcessing({ workspaceId, actionTypes: [actionType] })
        return true
      } catch (error) {
        logger.error('Error stopping processing', { error, workspaceId, actionType })
        throw new GraphQLError('Failed to stop processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('processFile', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessFileResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
      }),
    }),
    args: {
      input: t.arg({ type: ProcessFileInput, required: true }),
    },
    nullable: false,
    resolve: async (_parent, { input }, { workspaceId, session }) => {
      // Check if user has access to this library
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const parsedEvent = workspaceProcessing.EventSchemas.action.safeParse({
          version: 1,
          workspaceId,
          ...input,
        })

        if (!parsedEvent.success) {
          logger.error('Invalid event data for triggering processing', { error: parsedEvent.error, workspaceId, input })
          throw new GraphQLError('Invalid event data', { originalError: parsedEvent.error })
        }

        await workspaceProcessing.publishActionEvent(parsedEvent.data)
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process file event', { error, workspaceId, input })
        throw new GraphQLError('Failed to publish process file event', { originalError: error as Error })
      }
    },
  }),
)
