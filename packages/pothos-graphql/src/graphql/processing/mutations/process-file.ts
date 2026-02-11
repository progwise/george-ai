import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('processFile', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessFileResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: true }),
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true, description: 'IDs of the files to process' }),
    },
    nullable: false,
    resolve: async (_parent, { requestType, libraryId, fileId }, { workspaceId, session }) => {
      logger.debug('Processing files', { workspaceId, requestType, libraryId, fileId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        await workspace.processFile({ workspaceId, libraryId, fileId, requestType })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process file event', { error, workspaceId, requestType, libraryId, fileId })
        throw new GraphQLError('Failed to publish process file event', { originalError: error as Error })
      }
    },
  }),
)
