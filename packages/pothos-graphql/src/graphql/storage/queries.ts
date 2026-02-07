import { workspaceStorage } from '@george-ai/file-management'

import { builder } from '../builder'

builder.queryField('storageStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'StorageStatus',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: false }),
    },
    resolve: async (_source, { libraryId, fileId }, { workspaceId }) => {
      const storageStatus = await workspaceStorage.getStorageStatus(workspaceId, {
        libraryId,
        fileId,
      })
      return storageStatus
    },
  }),
)
