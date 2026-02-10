import { builder } from '../builder'

builder.inputType('FileChunksSelector', {
  fields: (t) => ({
    libraryId: t.string({ required: false }),
    fileId: t.string({ required: false }),
    extractionMethod: t.field({ type: 'ExtractionMethod', required: false }),
    fragment: t.int({ required: false }),
    chunk: t.int({ required: false }),
    modelName: t.string({ required: false }),
    contentGlobPattern: t.string({ required: false }),
    filenameGlobPattern: t.string({ required: false }),
    filePathGlobPattern: t.string({ required: false }),
    fileHash: t.string({ required: false }),
    fileMimeTypeGlobPattern: t.string({ required: false }),
    fileCreatedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    fileUpdatedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    fileUploadedAt: t.field({
      type: 'DateTimePeriod',
      required: false,
    }),
    creationAuthorGlobPattern: t.string({ required: false }),
    updateAuthorGlobPattern: t.string({ required: false }),
  }),
})
