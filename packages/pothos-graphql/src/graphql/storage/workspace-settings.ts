import { builder } from '../builder'

builder.simpleObject('WorkspaceSettings', {
  fields: (t) => ({
    storageLimitFiles: t.int({ nullable: true }),
    storageLimitBytes: t.int({ nullable: true }),
    embedding: t.field({
      type: builder.simpleObject('EmbeddingSettings', {
        fields: (t) => ({
          embeddingModelProvider: t.string({ nullable: false }),
          embeddingModelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
    imageAnalysis: t.field({
      type: builder.simpleObject('ImageAnalysisSettings', {
        fields: (t) => ({
          imageAnalysisModelProvider: t.string({ nullable: false }),
          imageAnalysisModelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
  }),
})
