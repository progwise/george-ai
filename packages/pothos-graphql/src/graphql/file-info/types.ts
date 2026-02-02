import * as storage from '@george-ai/file-management'

import { builder } from '../builder'

export const StorageUsage = builder.objectRef<storage.StorageUsage>('StorageUsage').implement({
  description: 'Storage usage information for a workspace',
  fields: (t) => ({
    sourceBytes: t.exposeInt('sourceBytes', { nullable: false }),
    extractedBytes: t.exposeInt('extractedBytes', { nullable: false }),
    activeExtractedBytes: t.exposeInt('activeExtractedBytes', { nullable: false }),
    physicalBytes: t.exposeInt('physicalBytes', { nullable: false }),
    sourceFiles: t.exposeInt('sourceFiles', { nullable: false }),
    extractions: t.exposeInt('extractions', { nullable: false }),
    activeExtractions: t.exposeInt('activeExtractions', { nullable: false }),
    extractionFiles: t.exposeInt('extractionFiles', { nullable: false }),
    physicalFiles: t.exposeInt('physicalFiles', { nullable: false }),
    lastUpdate: t.expose('lastUpdate', { type: 'DateTime', nullable: true }),
    lastReconcile: t.expose('lastReconcile', { type: 'DateTime', nullable: true }),
  }),
})

export const FileInfoExtraction = builder
  .objectRef<storage.FileManifest['extractions'][number]>('FileInfoExtraction')
  .implement({
    description: 'Information about an extraction available for a file',
    fields: (t) => ({
      extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
      extractionHash: t.exposeString('extractionHash', { nullable: false }),
      extractionDate: t.expose('extractionDate', { type: 'DateTime', nullable: false }),
    }),
  })

export const FileInfo = builder.objectRef<storage.FileManifest>('FileInfo').implement({
  description: 'Information about a file stored in the AI library',
  fields: (t) => ({
    fileId: t.exposeString('id', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    originalContentHash: t.exposeString('originalContentHash', { nullable: true }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    originalUpdatedAt: t.expose('originalUpdatedAt', { type: 'DateTime', nullable: true }),
    usage: t.field({ type: StorageUsage, nullable: false, resolve: (file) => file.usage }),
    extractions: t.field({
      type: [FileInfoExtraction],
      nullable: { list: false, items: false },
      description: 'Available extractions for this file (e.g., CSV, PDF with different models)',
      resolve: (file) => file.extractions,
    }),
  }),
})
