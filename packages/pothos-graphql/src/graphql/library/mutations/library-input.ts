import { builder } from '../../builder'

builder.inputType('LibraryInput', {
  fields: (t) => ({
    name: t.string({ required: false }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    embeddingModelId: t.string({ required: false }),
    ocrModelId: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
    embeddingTimeoutMs: t.int({ required: false }),
    autoProcessCrawledFiles: t.boolean({ required: false }),
  }),
})
