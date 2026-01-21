import { builder } from '../builder'

export const EmbeddingRequestInput = builder.inputType('EmbeddingRequestInput', {
  fields: (t) => ({
    libraryId: t.string({ required: true }),
    fileId: t.string({ required: true }),
    fileFragmentIndex: t.int({ required: false }),
    extractionMethod: t.string({ required: false }),
  }),
})
