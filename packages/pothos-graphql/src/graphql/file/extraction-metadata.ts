import { ExtractionMetadata } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<ExtractionMetadata>('ExtractionMetadata').implement({
  description: 'Metadata about a specific extraction of a file',
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    extractedAt: t.expose('extractedAt', { type: 'DateTime', nullable: false }),
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
    sourceHash: t.exposeString('sourceHash', { nullable: false }),
    extractionFiles: t.exposeInt('extractionFiles', { nullable: false }),
    physicalFiles: t.exposeInt('physicalFiles', { nullable: false }),
    extractedBytes: t.exposeInt('extractedBytes', { nullable: false }),
    physicalBytes: t.exposeInt('physicalBytes', { nullable: false }),
    hasFragments: t.exposeBoolean('hasFragments', { nullable: false }),
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
