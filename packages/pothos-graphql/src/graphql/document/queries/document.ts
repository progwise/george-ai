import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('document', (t) => {
  return t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { libraryId, fileId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const file = await prisma.aiLibraryFile.findFirstOrThrow({
          ...query,
          where: { id: fileId, libraryId, library: { workspaceId } },
        })
        return file
      } catch (error) {
        logger.error('Error fetching file', { error, workspaceId, libraryId, fileId })
        throw new GraphQLError('Failed to fetch file', { originalError: error as Error })
      }
    },
  })
})
