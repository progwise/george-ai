import { GraphQLError } from 'graphql/error/GraphQLError'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
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
      fragment: t.arg.int({ required: false }),
    },
    resolve: async (_root, { documentId, libraryId, workspaceId, extractionMethod, fragment }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const workspaceSettings = await getWorkspaceSettings(workspaceId)
      const embedding = workspaceSettings?.embedding
      if (!embedding || !embedding.modelDriver || !embedding.modelName) {
        throw new GraphQLError('Workspace Manifest not found for workspaceId: ' + workspaceId)
      }
      try {
        const chunkCount = await vectorStore.getChunkCount({
          workspaceId,
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
          libraryId,
          documentId,
          extractionMethod,
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
