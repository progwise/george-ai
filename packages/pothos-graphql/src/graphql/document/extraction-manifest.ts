import { ExtractionManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<ExtractionManifest>('ExtractionManifest').implement({
  description: 'Metadata about a specific extraction of a file',
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    workspaceId: t.exposeID('workspaceId', { nullable: false }),
    libraryId: t.exposeID('libraryId', { nullable: false }),
    documentId: t.exposeID('documentId', { nullable: false }),
    created: t.expose('created', { type: 'DateTime', nullable: false }),
    creator: t.exposeID('creator', { nullable: true }),
    updated: t.expose('updated', { type: 'DateTime', nullable: true }),
    extracted: t.expose('extracted', { type: 'DateTime', nullable: true }),
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
    sourceHash: t.exposeString('sourceHash', { nullable: false }),
    fragmentCount: t.exposeInt('fragmentCount', { nullable: true }),
    hasFragments: t.field({
      type: 'Boolean',
      nullable: false,
      resolve: (manifest) => manifest.fragmentCount !== undefined && manifest.fragmentCount > 0,
    }),
    attachments: t.field({
      type: ['Attachment'],
      nullable: { list: true, items: false },
      resolve: (extraction) => extraction.attachments || [],
    }),
    storageStats: t.field({
      type: 'StorageStats',
      nullable: true,
      resolve: (extraction) => extraction.storageStats || null,
    }),
  }),
})
