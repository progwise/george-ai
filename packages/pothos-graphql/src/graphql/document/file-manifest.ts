import { DocumentManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<DocumentManifest>('DocumentManifest').implement({
  description: 'Information about a file stored in the AI library',
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    created: t.expose('created', { type: 'DateTime', nullable: false }),
    origin: t.field({
      type: builder.simpleObject('DocumentOrigin', {
        fields: (t) => ({
          uri: t.string({ nullable: true }),
          hash: t.string({ nullable: true }),
          creationDate: t.field({ type: 'DateTime', nullable: true }),
          lastModifiedDate: t.field({ type: 'DateTime', nullable: true }),
          author: t.string({ nullable: true }),
        }),
      }),
      nullable: true,
      resolve: (manifest) => manifest.origin,
    }),
    storageStats: t.field({
      type: 'StorageStats',
      nullable: false,
      resolve: (manifest) => manifest.storageStats,
    }),
    extractions: t.field({
      type: [
        builder.simpleObject('DocumentExtraction', {
          fields: (t) => ({
            extractionMethod: t.field({ type: 'ExtractionMethod', nullable: false }),
            sourceHash: t.field({ type: 'String', nullable: false }),
            created: t.field({ type: 'DateTime', nullable: false }),
            updated: t.field({ type: 'DateTime', nullable: true }),
          }),
        }),
      ],
      nullable: { list: false, items: false },
      description: 'Available extractions for this file (e.g., CSV, PDF with different models)',
      resolve: (document) => document.extractions,
    }),
  }),
})
