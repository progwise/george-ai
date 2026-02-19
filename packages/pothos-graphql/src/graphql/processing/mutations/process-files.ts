import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow, processing } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('processFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessFilesResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: true }),
      libraryId: t.arg.string({ required: true }),
      fileIds: t.arg.stringList({ required: true, description: 'IDs of the files to process' }),
    },
    nullable: false,
    resolve: async (_parent, { requestType, libraryId, fileIds }, { workspaceId, session }) => {
      logger.debug('Processing files', { workspaceId, requestType, libraryId, fileIds })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        await processing.processFiles({ workspaceId, libraryId, fileIds, requestType })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process files event', { error, workspaceId, requestType, libraryId, fileIds })
        throw new GraphQLError('Failed to publish process files event', { originalError: error as Error })
      }
    },
  }),
)
