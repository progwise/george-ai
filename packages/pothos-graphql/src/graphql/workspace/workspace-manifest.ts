import { WorkspaceManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<WorkspaceManifest>('WorkspaceManifest').implement({
  description: 'Manifest information about a workspace',
  fields: (t) => ({
    workspaceId: t.exposeID('workspaceId', { nullable: false }),
    version: t.exposeInt('version', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    created: t.expose('created', { type: 'DateTime', nullable: false }),
    updated: t.expose('updated', { type: 'DateTime', nullable: true }),

    settings: t.field({
      type: 'WorkspaceSettings',
      resolve: (workspace) => workspace.settings,
      nullable: false,
    }),
    storageStats: t.field({
      type: 'StorageStats',
      resolve: (workspace) => workspace.storageStats,
      nullable: false,
    }),
  }),
})
