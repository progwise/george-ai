import { GraphQLError } from 'graphql/error/GraphQLError'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('vectorStore', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('VectorStore', {
      fields: (t) => ({
        workspaceId: t.string({ nullable: false }),
        name: t.string({ nullable: true }),
        exists: t.boolean({ nullable: false }),
        version: t.int({ nullable: true }),
        status: t.string({ nullable: true }),
        chunkCount: t.int({ nullable: true }),
        warnings: t.stringList({ nullable: true }),
      }),
    }),
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const workspaceSettings = await getWorkspaceSettings(workspaceId)
      const embedding = workspaceSettings?.embedding
      if (!embedding || !embedding.modelDriver || !embedding.modelName) {
        logger.warn('Embedding not configured for workspace', { workspaceId })
        return {
          workspaceId,
          exists: false,
          version: null,
          status: 'Embedding not configured',
          chunkCount: null,
          warnings: null,
        }
      }
      try {
        const vectorStoreInformation = await vectorStore.getVectorStore({
          workspaceId,
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
        })
        return {
          ...vectorStoreInformation,
        }
      } catch (error) {
        logger.error('Error fetching vector store information', {
          error,
          workspaceId,
        })
        throw new GraphQLError('Failed to fetch vector store information', { originalError: error as Error })
      }
    },
  }),
)
