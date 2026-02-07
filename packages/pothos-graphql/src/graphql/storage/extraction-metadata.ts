import { type ExtractionMetadata } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<ExtractionMetadata>('ExtractionMetadata').implement({
  description: 'Information about an available extraction for a file',
  fields: (t) => ({
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
    extractionDate: t.expose('extractedAt', { type: 'DateTime', nullable: false }),
    version: t.exposeInt('version', { nullable: true }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    extractedBytes: t.exposeInt('extractedBytes', { nullable: true }),
    physicalBytes: t.exposeInt('physicalBytes', { nullable: true }),
    extractionFiles: t.exposeInt('extractionFiles', { nullable: true }),
    physicalFiles: t.exposeInt('physicalFiles', { nullable: true }),
    extractedAt: t.expose('extractedAt', { type: 'DateTime', nullable: true }),
    hasFragments: t.exposeBoolean('hasFragments', { nullable: true }),
    splitFragmentPattern: t.exposeString('splitFragmentPattern', { nullable: true }),
    fragmentCount: t.exposeInt('fragmentCount', { nullable: true }),
    attachments: t.field({
      type: [
        builder.objectRef<NonNullable<ExtractionMetadata['attachments']>[number]>('ExtractionAttachment').implement({
          fields: (t) => ({
            size: t.exposeInt('size', { nullable: false }),
            filename: t.exposeString('filename', { nullable: false }),
            mimeType: t.exposeString('mimeType', { nullable: true }),
          }),
        }),
      ],
      nullable: { list: true, items: false },
      resolve: (extraction) => extraction.attachments || [],
    }),
  }),
})
