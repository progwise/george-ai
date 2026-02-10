import { LibraryManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<LibraryManifest>('LibraryManifest').implement({
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    settings: t.field({
      type: 'LibrarySettings',
      nullable: false,
      resolve: (manifest) => {
        return manifest.settings
      },
    }),
    usage: t.field({
      type: 'StorageUsage',
      nullable: true,
      resolve: (manifest) => {
        return manifest.usage || null
      },
    }),
  }),
})
