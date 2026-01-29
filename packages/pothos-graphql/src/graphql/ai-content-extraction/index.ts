import { BACKEND_PUBLIC_URL } from '../../global-config'
import { builder } from '../builder'

console.log('Setting up: ContentExtraction')

export const ExtractionInfo = builder
  .objectRef<{
    fileId: string
    libraryId: string
    fileName: string
    extractionMethod: string
    extractionHash: string
    extractionDate: string
    version?: 1 | undefined
    sourceHash?: string | undefined
    extractedBytes?: number | undefined
    physicalBytes?: number | undefined
    extractionFiles?: number | undefined
    physicalFiles?: number | undefined
    extractedAt?: string | undefined
    hasFragments?: boolean | undefined
    splitFragmentPattern?: string | undefined
    fragmentCount?: number | undefined
    attachments?:
      | {
          size: number
          filename: string
          mimeType?: string | undefined
        }[]
      | undefined
  }>('ExtractionInfo')
  .implement({
    description: 'Information about an available extraction for a file',
    fields: (t) => ({
      fileId: t.exposeString('fileId', { nullable: false }),
      libraryId: t.exposeString('libraryId', { nullable: false }),
      fileName: t.string({
        nullable: false,
        resolve: ({ fileId }) => `${fileId}-extraction`,
      }),
      extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
      extractionHash: t.exposeString('extractionHash', { nullable: false }),
      extractionDate: t.exposeString('extractionDate', { nullable: false }),
      version: t.exposeInt('version', { nullable: true }),
      sourceHash: t.exposeString('sourceHash', { nullable: true }),
      extractedBytes: t.exposeInt('extractedBytes', { nullable: true }),
      physicalBytes: t.exposeInt('physicalBytes', { nullable: true }),
      extractionFiles: t.exposeInt('extractionFiles', { nullable: true }),
      physicalFiles: t.exposeInt('physicalFiles', { nullable: true }),
      extractedAt: t.exposeString('extractedAt', { nullable: true }),
      hasFragments: t.exposeBoolean('hasFragments', { nullable: true }),
      splitFragmentPattern: t.exposeString('splitFragmentPattern', { nullable: true }),
      fragmentCount: t.exposeInt('fragmentCount', { nullable: true }),
      attachments: t.field({
        type: [
          builder
            .objectRef<{
              size: number
              filename: string
              mimeType?: string | undefined
            }>('ExtractionAttachment')
            .implement({
              fields: (t) => ({
                size: t.exposeInt('size', { nullable: false }),
                filename: t.exposeString('filename', { nullable: false }),
                mimeType: t.exposeString('mimeType', { nullable: true }),
              }),
            }),
        ],
        nullable: { list: false, items: false },
        resolve: (extraction) => extraction.attachments || [],
      }),
      mainFileUrl: t.string({
        nullable: false,
        resolve: ({ libraryId, fileId, extractionMethod, fileName }) =>
          BACKEND_PUBLIC_URL +
          `/library-files/${libraryId}/${fileId}?extractionMethod=${extractionMethod}&filename=${fileName}`,
      }),
    }),
  })
