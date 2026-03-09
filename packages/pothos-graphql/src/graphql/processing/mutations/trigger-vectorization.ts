import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow, triggerVectorization } from '@george-ai/app-domain'
import { getDocument } from '@george-ai/file-management'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('triggerVectorization', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TriggerVectorizationResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
      }),
    }),
    args: {
      extractionMethod: t.arg({ type: 'ExtractionMethod', required: false }),
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true, description: 'IDs of the document to process' }),
    },
    nullable: false,
    resolve: async (_parent, { extractionMethod, libraryId, documentId }, { workspaceId, session }) => {
      logger.debug('Trigger vectorization', { workspaceId, extractionMethod, libraryId, documentId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const documentManifest = await getDocument({ workspaceId, libraryId, documentId })

      if (!documentManifest) {
        throw new GraphQLError('Document does not exist')
      }

      try {
        await triggerVectorization({ documentManifest, extractionMethod })
        return { success: true }
      } catch (error) {
        logger.error('Error publishing trigger vectorization event', { error, extractionMethod, documentManifest })
        throw new GraphQLError('Failed to trigger vectorization', { originalError: error as Error })
      }
    },
  }),
)
