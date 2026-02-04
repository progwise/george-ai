import { GraphQLError } from 'graphql/error'

import { canWriteWorkspaceOrThrow, library } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.mutationField('upgradeLibraryFromLegacy', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const result = await library.upgradeFromLegacy({ workspaceId, libraryId })
        return result
      } catch (error) {
        console.error('Error elevating library from legacy', { workspaceId, libraryId, error })
        throw new GraphQLError('Failed to elevate library from legacy', { originalError: error as Error })
      }
    },
  }),
)
