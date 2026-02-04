import { FileManifest } from '@george-ai/file-management'

import { builder } from '../builder'

const FileInfoExtraction = builder.objectRef<FileManifest['extractions'][number]>('FileInfoExtraction').implement({
  description: 'Information about an extraction available for a file',
  fields: (t) => ({
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
    extractionHash: t.exposeString('extractionHash', { nullable: false }),
    extractionDate: t.expose('extractionDate', { type: 'DateTime', nullable: false }),
  }),
})

builder.objectRef<FileManifest>('FileManifest').implement({
  description: 'Information about a file stored in the AI library',
  fields: (t) => ({
    fileId: t.exposeString('id', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    originalContentHash: t.exposeString('originalContentHash', { nullable: true }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    originalUpdatedAt: t.expose('originalUpdatedAt', { type: 'DateTime', nullable: true }),
    usage: t.field({ type: 'StorageUsage', nullable: false, resolve: (file) => file.usage }),
    extractions: t.field({
      type: [FileInfoExtraction],
      nullable: { list: false, items: false },
      description: 'Available extractions for this file (e.g., CSV, PDF with different models)',
      resolve: (file) => file.extractions,
    }),
  }),
})
