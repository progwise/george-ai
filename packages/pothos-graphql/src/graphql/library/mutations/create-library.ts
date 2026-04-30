import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow, createLibrary } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('createLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { name, description }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const result = await createLibrary(workspaceId, {
        name,
        description: description || undefined,
      })

      const library = await prisma.aiLibrary.findFirst({
        ...query,
        where: {
          id: result.libraryId,
          workspaceId,
        },
      })
      if (!library) {
        throw new GraphQLError('Library not found')
      }
      return library
    },
  }),
)
