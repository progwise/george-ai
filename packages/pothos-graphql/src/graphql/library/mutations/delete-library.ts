import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { library as lib } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'

builder.mutationField('deleteLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    nullable: false,
    resolve: async (query, _source, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const result = await prisma.$transaction(
          [
            prisma.aiLibraryFile.deleteMany({ where: { libraryId } }),
            prisma.aiLibraryCrawler.deleteMany({ where: { libraryId } }),
            prisma.aiLibrary.delete({
              ...query,
              where: { id: libraryId },
            }),
          ],
          {},
        )
        await Promise.all([
          lib.delete(workspaceId, { libraryId }),
          vectorStore.removeChunks({ workspaceId, libraryId }),
        ])

        return result[2]
      } catch (error) {
        console.error('Error deleting library', { workspaceId, libraryId, error })
        throw new GraphQLError('Failed to delete library', { originalError: error as Error })
      }
    },
  }),
)
