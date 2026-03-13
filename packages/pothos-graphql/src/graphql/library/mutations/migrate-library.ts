import { GraphQLError } from 'graphql/error/GraphQLError'

import { canAdminWorkspaceOrThrow, migrateLibrary } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('migrateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('MigrateLibraryResponse', {
      fields: (t) => ({
        library: t.field({ type: 'LibraryManifest', nullable: false }),
        fileMigrationsPublished: t.int({ nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId, libraryId }, { session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const result = await migrateLibrary({ workspaceId, libraryId })
        return result
      } catch (error) {
        logger.error('Error migrating library', { error, workspaceId, libraryId })
        throw new GraphQLError('Failed to migrate library', { originalError: error as Error })
      }
    },
  }),
)
