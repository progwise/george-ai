import { GraphQLError } from 'graphql'

import { canWriteWorkspaceOrThrow, workspace } from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../builder'
import { logger } from './common'

export const ProcessFilesInput = builder.inputType('ProcessFilesInput', {
  fields: (t) => ({
    actionType: t.field({ type: 'ActionType', required: true }),
    libraryId: t.string({ required: true }),
    fileIds: t.stringList({ required: true, description: 'IDs of the files to process' }),
  }),
})

export const ProcessFileInput = builder.inputType('ProcessFileInput', {
  fields: (t) => ({
    actionType: t.field({ type: 'ActionType', required: true }),
    libraryId: t.string({ required: true }),
    fileId: t.string({ required: true }),
    fragment: t.int({ required: false }),
  }),
})

builder.mutationField('startEventProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('StartEventProcessingResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      actionType: t.arg({ type: 'ActionType', required: true }),
    },
    nullable: false,
    resolve: async (_parent, { actionType }, { workspaceId, session }) => {
      logger.debug('Starting processing', { workspaceId, actionType })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.startProcessing({ workspaceId, actionTypes: [actionType] })
        return { success: true }
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId, actionType })
        throw new GraphQLError('Failed to start processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('stopEventProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('StopEventProcessingResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    nullable: false,
    args: {
      actionType: t.arg({ type: 'ActionType', required: true }),
    },
    resolve: async (_parent, { actionType }, { workspaceId, session }) => {
      logger.debug('Stopping processing', { workspaceId, actionType })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.stopProcessing({ workspaceId, actionTypes: [actionType] })
        return { success: true }
      } catch (error) {
        logger.error('Error stopping processing', { error, workspaceId, actionType })
        throw new GraphQLError('Failed to stop processing', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('processFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessFilesResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      input: t.arg({ type: ProcessFilesInput, required: true }),
    },
    nullable: false,
    resolve: async (_parent, { input }, { workspaceId, session }) => {
      logger.debug('Processing files', { workspaceId, input })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const { libraryId, fileIds, actionType } = input

      await workspace.processFiles({ workspaceId, libraryId, fileIds, actionType })

      try {
        await workspace.processFiles({ workspaceId, libraryId, fileIds, actionType })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process files event', { error, workspaceId, input })
        throw new GraphQLError('Failed to publish process file event', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('processFile', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessFileResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      input: t.arg({ type: ProcessFileInput, required: true }),
    },
    nullable: false,
    resolve: async (_parent, { input }, { workspaceId, session }) => {
      logger.debug('Processing file', { workspaceId, input })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const { libraryId, fileId, fragment, actionType } = input

      try {
        await workspace.processFile({ workspaceId, libraryId, fileId, fragment, actionType })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process file event', { error, workspaceId, input })
        throw new GraphQLError('Failed to publish process file event', { originalError: error as Error })
      }
    },
  }),
)
