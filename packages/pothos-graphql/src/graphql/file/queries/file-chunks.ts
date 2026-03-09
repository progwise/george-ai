import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { ExtractionMethod } from '@george-ai/app-schema'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'

const response = builder
  .objectRef<{
    workspaceId: string
    fileId: string
    libraryId: string
    take: number
    skip: number
    extractionMethod?: ExtractionMethod | null
    fragment?: number | null
    totalCount: number | null
  }>('FileChunksResponse')
  .implement({
    fields: (t) => ({
      totalCount: t.exposeInt('totalCount', { nullable: true }),
      chunks: t.field({
        type: ['FileChunk'],
        nullable: false,
        resolve: async (root) => {
          const { workspaceId, libraryId, fileId, extractionMethod, fragment, take = 10, skip = 0 } = root
          const chunks = await vectorStore.getChunks({
            workspaceId, // Not needed for fetching chunks as it's already validated in the resolver
            libraryId,
            fileId,
            extractionMethod,
            take,
            skip,
            fragment,
          })
          return chunks
        },
      }),
    }),
  })

builder.queryField('fileChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: response,
    nullable: true,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
      take: t.arg.int({ required: false }),
      skip: t.arg.int({ required: false }),
      extractionMethod: t.arg({
        type: 'ExtractionMethod',
        required: false,
      }),
      fragment: t.arg.int({ required: false }),
    },
    resolve: async (_root, { libraryId, fileId, take, skip, fragment, extractionMethod }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const totalCount = await vectorStore.getChunkCount({
        workspaceId,
        libraryId,
        fileId,
        extractionMethod,
        fragment,
      })
      return {
        workspaceId,
        fileId,
        libraryId,
        take: take ?? 10,
        skip: skip ?? 0,
        extractionMethod,
        fragment,
        totalCount,
      }
    },
  }),
)
