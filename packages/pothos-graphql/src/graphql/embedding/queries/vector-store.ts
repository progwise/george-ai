import { GraphQLError } from 'graphql/error/GraphQLError'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('vectorStore', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('VectorStore', {
      fields: (t) => ({
        id: t.string({ nullable: false }),
        name: t.string({ nullable: false }),
        exists: t.boolean({ nullable: false }),
        version: t.int({ nullable: true }),
        status: t.string({ nullable: true }),
        chunkCount: t.int({ nullable: true }),
        warnings: t.stringList({ nullable: true }),
        modelNames: t.stringList({ nullable: true }),
      }),
    }),
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const vectorStoreInformation = await vectorStore.getWorkspaceCollection(workspaceId)
        return {
          ...vectorStoreInformation,
          modelNames: vectorStoreInformation?.modelConfigs?.map((config) => config.modelName) || null,
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
