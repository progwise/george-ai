import { GraphQLError } from 'graphql/error/GraphQLError'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('embeddingStatistics', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['EmbeddingStatistic'],
    nullable: { list: true, items: false },
    args: {
      workspaceId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_root, { fileId, libraryId, workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const workspaceSettings = await getWorkspaceSettings(workspaceId)
      const embedding = workspaceSettings?.embedding
      if (!embedding || !embedding.modelDriver || !embedding.modelName) {
        logger.warn('No embedding statistics because embedding was is configured for workspace', { workspaceId })
        return null
      }
      try {
        const embeddingStatistics = await vectorStore.getEmbeddingStatistics({
          workspaceId,
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
          libraryId,
          fileId,
        })
        return embeddingStatistics
      } catch (error) {
        logger.error('Error fetching embeddings statistics', {
          error,
          workspaceId,
          fileId,
          libraryId,
        })
        throw new GraphQLError('Failed to fetch embeddings statistics', { originalError: error as Error })
      }
    },
  }),
)
