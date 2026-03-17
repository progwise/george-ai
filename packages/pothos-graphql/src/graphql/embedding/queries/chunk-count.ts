import { GraphQLError } from 'graphql/error/GraphQLError'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('chunkCount', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: true,
    args: {
      workspaceId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      extractionMethod: t.arg({ required: false, type: 'ExtractionMethod' }),
      modelName: t.arg.string({ required: false }),
      fragment: t.arg.int({ required: false }),
    },
    resolve: async (
      _root,
      { documentId, libraryId, workspaceId, extractionMethod, modelName, fragment },
      { session },
    ) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const chunkCount = await vectorStore.getChunkCount({
          workspaceId,
          libraryId,
          documentId,
          extractionMethod,
          modelName,
          fragment,
        })
        return chunkCount
      } catch (error) {
        logger.error('Error fetching chunk count', {
          error,
          workspaceId,
          documentId,
          libraryId,
        })
        throw new GraphQLError('Failed to fetch chunk count', { originalError: error as Error })
      }
    },
  }),
)
