import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow, triggerExtraction } from '@george-ai/app-domain'
import { getDocument } from '@george-ai/file-management'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('triggerExtraction', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TriggerExtractionResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
        documentManifest: t.field({ type: 'DocumentManifest', nullable: false }),
        extractionMethod: t.field({ type: 'ExtractionMethod', nullable: true }),
      }),
    }),
    args: {
      extractionMethod: t.arg({ type: 'ExtractionMethod', required: false }),
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true, description: 'IDs of the document to process' }),
    },
    nullable: false,
    resolve: async (_parent, { extractionMethod, libraryId, documentId }, { workspaceId, session }) => {
      logger.debug('Trigger extraction', { workspaceId, extractionMethod, libraryId, documentId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const documentManifest = await getDocument({ workspaceId, libraryId, documentId })

      if (!documentManifest) {
        throw new GraphQLError('Document does not exist')
      }

      try {
        await triggerExtraction({ documentManifest, extractionMethod })
        return { success: true, documentManifest, extractionMethod }
      } catch (error) {
        logger.error('Error publishing trigger extraction event', { error, extractionMethod, documentManifest })
        throw new GraphQLError('Failed to trigger extraction', { originalError: error as Error })
      }
    },
  }),
)
