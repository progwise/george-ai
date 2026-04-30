import { LibraryManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<LibraryManifest>('LibraryManifest').implement({
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    created: t.expose('created', { type: 'DateTime', nullable: false }),
    creator: t.exposeID('creator', { nullable: true }),
    updated: t.expose('updated', { type: 'DateTime', nullable: true }),
    attachments: t.field({
      type: ['Attachment'],
      nullable: { list: true, items: false },
      resolve: (manifest) => manifest.attachments || [],
    }),
    storageStats: t.field({
      type: 'StorageStats',
      nullable: true,
      resolve: (manifest) => manifest.storageStats || null,
    }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
  }),
})
