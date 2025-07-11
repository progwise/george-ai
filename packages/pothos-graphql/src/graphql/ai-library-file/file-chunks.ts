import { getFileChunks } from '@george-ai/langchain-chat'

import { prisma } from '../../prisma'
import { canAccessLibraryOrThrow } from '../ai-library/check-participation'
import { builder } from '../builder'

interface FileChunkType {
  id: string
  text: string
  section: string
  headingPath: string
  chunkIndex: number
  subChunkIndex: number
}
const FileChunk = builder.objectRef<FileChunkType>('FileChunk').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    text: t.exposeString('text', { nullable: false }),
    section: t.exposeString('section', { nullable: false }),
    headingPath: t.exposeString('headingPath', { nullable: false }),
    chunkIndex: t.exposeInt('chunkIndex', { nullable: false }),
    subChunkIndex: t.exposeInt('subChunkIndex', { nullable: false }),
  }),
})

const FileChunkQueryResponse = builder
  .objectRef<{
    libraryId: string
    fileId: string
    fileName: string
    count: number
    skip: number
    take: number
    chunks: FileChunkType[]
  }>('FileChunkQueryResponse')
  .implement({
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      fileId: t.exposeString('fileId', { nullable: false }),
      fileName: t.exposeString('fileName', { nullable: true }),
      count: t.exposeInt('count', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      take: t.exposeInt('take', { nullable: false }),
      chunks: t.field({
        type: [FileChunk],
        nullable: { items: false, list: false },
        resolve: async (parent) => {
          return parent.chunks
        },
      }),
    }),
  })

builder.queryField('aiFileChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: FileChunkQueryResponse,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
      take: t.arg.int({ required: true }),
      skip: t.arg.int({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId, skip, take }, context) => {
      canAccessLibraryOrThrow(context, libraryId)
      const fileInfo = await prisma.aiLibraryFile.findFirstOrThrow({ where: { libraryId, id: fileId } })
      const result = await getFileChunks({ libraryId, fileId, skip, take })
      return {
        libraryId,
        fileId,
        fileName: fileInfo.name,
        skip,
        take,
        count: result.count,
        chunks: result.chunks,
      }
    },
  }),
)
