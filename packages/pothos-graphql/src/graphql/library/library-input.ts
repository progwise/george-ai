import { builder } from '../builder'

builder.inputType('LibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    embeddingModelId: t.string({ required: false }),
    ocrModelId: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
    embeddingTimeoutMs: t.int({ required: false }),
    autoProcessCrawledFiles: t.boolean({ required: false }),
  }),
})

export interface LibraryInput {
  name: string
  description?: string
  url?: string
  embeddingModelId?: string
  ocrModelId?: string
  fileConverterOptions?: string
  embeddingTimeoutMs?: number
  autoProcessCrawledFiles?: boolean
}
