import type { ServiceProviderType } from '@george-ai/ai-service-client'
import { getFileChunks, getSimilarChunks } from '@george-ai/langchain-chat'

import { canAccessFileOrThrow } from '../../domain/file'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile FileChunks')

interface FileChunkType {
  id: string
  fileName: string | null
  fileId: string | null
  originUri: string | null
  text: string
  section: string
  headingPath: string
  chunkIndex: number
  subChunkIndex: number
  distance?: number
  points?: number
  part?: number
}
export const FileChunk = builder.objectRef<FileChunkType>('FileChunk').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: true }),
    fileId: t.exposeString('fileId', { nullable: true }),
    originUri: t.exposeString('originUri', { nullable: true }),
    text: t.exposeString('text', { nullable: false }),
    section: t.exposeString('section', { nullable: false }),
    headingPath: t.exposeString('headingPath', { nullable: false }),
    chunkIndex: t.exposeInt('chunkIndex', { nullable: false }),
    subChunkIndex: t.exposeInt('subChunkIndex', { nullable: false }),
    distance: t.exposeFloat('distance', { nullable: true }),
    points: t.exposeInt('points', { nullable: true }),
    part: t.exposeInt('part', { nullable: true }),
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
      take: t.arg.int({ required: true }),
      skip: t.arg.int({ required: true }),
    },
    resolve: async (_source, { fileId, skip, take }, context) => {
      const file = await canAccessFileOrThrow(fileId, context.session.user.id)

      const result = await getFileChunks({
        libraryId: file.libraryId,
        fileId,
        skip,
        take,
      })
      return {
        libraryId: file.libraryId,
        fileId,
        fileName: file.name,
        skip,
        take,
        count: result.count,
        chunks: result.chunks,
      }
    },
  }),
)

builder.queryField('aiSimilarFileChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [FileChunk],
    nullable: { items: false, list: false },
    args: {
      fileId: t.arg.string({ required: true }),
      term: t.arg.string({ required: false }),
      hits: t.arg.int({ required: false, defaultValue: 20 }),
    },
    resolve: async (_source, { fileId, term, hits }, context) => {
      const file = await canAccessFileOrThrow(fileId, context.session.user.id)

      // Load library with embeddingModel relation
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        where: { id: file.libraryId },
        select: {
          id: true,
          workspaceId: true,
          embeddingModel: { select: { name: true, provider: true } },
        },
      })

      if (!library.embeddingModel) {
        throw new Error(
          `Cannot perform similarity search. Library ${file.libraryId} does not have an embedding model configured.`,
        )
      }

      if (!term || term.length === 0) {
        return []
      }

      const result = await getSimilarChunks({
        workspaceId: library.workspaceId,
        fileId,
        libraryId: file.libraryId,
        embeddingsModelProvider: library.embeddingModel.provider as ServiceProviderType,
        embeddingsModelName: library.embeddingModel.name,
        term,
        hits: hits || undefined,
      })

      return result
    },
  }),
)
