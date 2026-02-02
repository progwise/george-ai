import { GraphQLError } from 'graphql/error'

import { workspaceStorage } from '@george-ai/file-management'

import { builder } from '../builder'
import { canReadWorkspaceOrThrow } from '../workspace'
import { FileInfo } from './types'

builder.queryField('fileInfo', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: FileInfo,
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
