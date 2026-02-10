import { builder } from '../builder'

builder.simpleObject('LibrarySettings', {
  fields: (t) => ({
    storageLimitFiles: t.int({ nullable: true }),
    storageLimitBytes: t.int({ nullable: true }),
    embedding: t.field({
      type: builder.simpleObject('LibraryEmbeddingSettings', {
        fields: (t) => ({
          embeddingModelProvider: t.string({ nullable: false }),
          embeddingModelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
    imageAnalysis: t.field({
      type: builder.simpleObject('LibraryImageAnalysisSettings', {
        fields: (t) => ({
          imageAnalysisModelProvider: t.string({ nullable: false }),
          imageAnalysisModelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
  }),
})
