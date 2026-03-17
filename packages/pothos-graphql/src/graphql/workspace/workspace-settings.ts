import { builder } from '../builder'

builder.simpleObject('WorkspaceSettings', {
  fields: (t) => ({
    storageLimitFiles: t.int({ nullable: true }),
    storageLimitBytes: t.int({ nullable: true }),
    embedding: t.field({
      type: builder.simpleObject('WorkspaceEmbeddingSettings', {
        fields: (t) => ({
          modelDriver: t.field({ type: 'InferenceDriver', nullable: false }),
          modelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
    imageAnalysis: t.field({
      type: builder.simpleObject('WorkspaceImageAnalysisSettings', {
        fields: (t) => ({
          modelDriver: t.field({ type: 'InferenceDriver', nullable: false }),
          modelName: t.string({ nullable: false }),
        }),
      }),
      nullable: true,
    }),
  }),
})
