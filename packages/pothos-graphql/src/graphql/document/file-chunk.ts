import { VectorStoreChunk } from '@george-ai/vector-store'

import { builder } from '../builder'

builder.objectRef<VectorStoreChunk>('VectorStoreChunk').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    documentName: t.exposeString('documentName', { nullable: true }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
    chunk: t.exposeInt('chunk', { nullable: false }),
    fragment: t.exposeInt('fragment', { nullable: true }),
    content: t.exposeString('content', { nullable: true }),
  }),
})
