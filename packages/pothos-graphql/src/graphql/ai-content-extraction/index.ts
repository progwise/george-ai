import { builder } from '../builder'

console.log('Setting up: ContentExtraction')

export const ExtractionInfo = builder
  .objectRef<{
    extractionMethod: string
    extractionMethodParameter: string | null
    totalParts: number
    totalSize: number
    isBucketed: boolean
    mainFileUrl: string
  }>('ExtractionInfo')
  .implement({
    description: 'Information about an available extraction for a file',
    fields: (t) => ({
      extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
      extractionMethodParameter: t.exposeString('extractionMethodParameter', { nullable: true }),
      totalParts: t.exposeInt('totalParts', { nullable: false }),
      totalSize: t.exposeInt('totalSize', { nullable: false }),
      isBucketed: t.exposeBoolean('isBucketed', { nullable: false }),
      mainFileUrl: t.exposeString('mainFileUrl', { nullable: false }),
      displayName: t.string({
        nullable: false,
        resolve: (extraction) => {
          const method = extraction.extractionMethod.replace('-extraction', '').toUpperCase()
          if (extraction.extractionMethodParameter) {
            return `${method} (${extraction.extractionMethodParameter})`
          }
          return method
        },
      }),
    }),
  })
