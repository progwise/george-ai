import { canCreateWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { logger } from './common'

builder.mutationField('createWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('CreateWorkspaceResult', {
      fields: (t) => ({
        id: t.id({ nullable: false }),
        name: t.string({ nullable: false }),
        slug: t.string({ nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
    },
    resolve: async (_root, { name, slug }, { workspaceId, session }) => {
      logger.debug('Attempting to create workspace', { name, slug, userId: session.user.id })
      const userId = session.user.id
      await canCreateWorkspaceOrThrow({ workspaceId, userId })
      const createdWorkspace = await workspace.createWorkspace({ name, slug, userId })
      logger.debug('Workspace created successfully', { workspaceId: createdWorkspace.id, name, slug, userId })
      return createdWorkspace
    },
  }),
)
