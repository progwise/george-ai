import { GraphQLError } from 'graphql/error'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceStorage } from '@george-ai/file-management'

import { builder } from '../builder'

builder.queryField('fileInfo', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'FileManifest',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId, fileId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const fileInfo = await workspaceStorage.getFile(workspaceId, {
        libraryId,
        fileId,
      })
      if (!fileInfo) {
        throw new GraphQLError('File not found in storage')
      }
      return fileInfo
    },
  }),
)
