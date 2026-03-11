import { FileChunk } from '@george-ai/vector-store'

import { builder } from '../builder'

builder.objectRef<FileChunk>('FileChunk').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: true }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
    chunk: t.exposeInt('chunk', { nullable: false }),
    fragment: t.exposeInt('fragment', { nullable: true }),
    embeddingModelNames: t.exposeStringList('embeddingModelNames', { nullable: true }),
    content: t.exposeString('content', { nullable: true }),
  }),
})
