import { builder } from '../builder'

builder.inputType('DocumentChunksSelector', {
  fields: (t) => ({
    libraryId: t.string({ required: false }),
    documentId: t.string({ required: false }),
    extractionMethod: t.field({ type: 'ExtractionMethod', required: false }),
    fragment: t.int({ required: false }),
    chunk: t.int({ required: false }),
    modelName: t.string({ required: false }),
    contentGlobPattern: t.string({ required: false }),
    documentNameGlobPattern: t.string({ required: false }),
    namePathGlobPattern: t.string({ required: false }),
    nameHash: t.string({ required: false }),
    nameMimeTypeGlobPattern: t.string({ required: false }),
    nameCreatedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    nameUpdatedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    nameUploadedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    creationAuthorGlobPattern: t.string({ required: false }),
    updateAuthorGlobPattern: t.string({ required: false }),
  }),
})
