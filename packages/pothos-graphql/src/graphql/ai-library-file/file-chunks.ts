import { getFileChunks } from '@george-ai/langchain-chat'

import { builder } from '../builder'

const FileChunk = builder
  .objectRef<{
    id: string
    text: string
    section: string
    headingPath: string
    chunkIndex: number
    subChunkIndex: number
  }>('FileChunk')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      text: t.exposeString('text', { nullable: false }),
      section: t.exposeString('section', { nullable: true }),
      headingPath: t.exposeString('headingPath', { nullable: true }),
      chunkIndex: t.exposeInt('chunkIndex', { nullable: true }),
      subChunkIndex: t.exposeInt('subChunkIndex', { nullable: true }),
    }),
  })

builder.queryField('readFileChunks', (t) =>
  t.field({
    type: [FileChunk],
    nullable: { items: false, list: false },
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId }) => {
      const chunks = await getFileChunks({ libraryId, fileId })
      return chunks
    },
  }),
)
