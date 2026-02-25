import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow, processDocument } from '@george-ai/app-domain'
import { getDocument } from '@george-ai/file-management'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('processDocument', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('ProcessDocumentResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: true }),
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true, description: 'IDs of the document to process' }),
    },
    nullable: false,
    resolve: async (_parent, { requestType, libraryId, documentId }, { workspaceId, session }) => {
      logger.debug('Processing files', { workspaceId, requestType, libraryId, documentId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const documentManifest = await getDocument({ workspaceId, libraryId, documentId })

      if (!documentManifest) {
        throw new GraphQLError('Document does not exist')
      }

      try {
        await processDocument({ documentManifest, requestType })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing process file event', { error, requestType, documentManifest })
        throw new GraphQLError('Failed to publish process file event', { originalError: error as Error })
      }
    },
  }),
)
