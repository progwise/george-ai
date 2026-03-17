import { DocumentChunk } from '@george-ai/vector-store'

import { builder } from '../builder'

builder.objectRef<DocumentChunk>('DocumentChunk').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    documentName: t.exposeString('documentName', { nullable: true }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
    chunk: t.exposeInt('chunk', { nullable: false }),
    fragment: t.exposeInt('fragment', { nullable: true }),
    embeddingModelNames: t.exposeStringList('embeddingModelNames', { nullable: true }),
    content: t.exposeString('content', { nullable: true }),
  }),
})
