import { WorkspaceManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<WorkspaceManifest>('WorkspaceManifest').implement({
  description: 'Manifest information about a workspace',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    version: t.exposeInt('version', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),

    settings: t.field({
      type: 'WorkspaceSettings',
      resolve: (workspace) => workspace.settings,
      nullable: false,
    }),
    usage: t.field({
      type: 'StorageUsage',
      resolve: (workspace) => workspace.usage,
      nullable: false,
    }),
  }),
})
