import { FileManifest } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<FileManifest>('FileManifest').implement({
  description: 'Information about a file stored in the AI library',
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    fileId: t.exposeString('id', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    originalContentHash: t.exposeString('originalContentHash', { nullable: true }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    originalUpdatedAt: t.expose('originalUpdatedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    usage: t.field({ type: 'StorageUsage', nullable: false, resolve: (file) => file.usage }),
    extractions: t.field({
      type: [
        builder.simpleObject('FileExtraction', {
          fields: (t) => ({
            extractionMethod: t.field({ type: 'ExtractionMethod', nullable: false }),
            extractionHash: t.string({ nullable: false }),
            extractionDate: t.field({ type: 'DateTime', nullable: false }),
          }),
        }),
      ],
      nullable: { list: false, items: false },
      description: 'Available extractions for this file (e.g., CSV, PDF with different models)',
      resolve: (file) => file.extractions,
    }),
  }),
})
