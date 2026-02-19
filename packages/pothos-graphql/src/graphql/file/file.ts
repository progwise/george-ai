import { prisma } from '@george-ai/app-database'
import { getAvailableMethodsForMimeType } from '@george-ai/file-converter'
import { document } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../builder'

/*
Main file object for GraphQL usage. AiLibraryFile is because we use our grown prisma model.
TODO: Decide if we keep AiLibraryFile as type name or change it to File and rename the prisma model as well.
*/
builder.prismaObject('AiLibraryFile', {
  name: 'AiLibraryFile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    name: t.exposeString('name', { nullable: false }),
    originUri: t.exposeString('originUri', { nullable: true }),
    docPath: t.exposeString('docPath', { nullable: true }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    size: t.exposeInt('size', { nullable: true }),
    libraryId: t.exposeString('libraryId', {
      nullable: false,
    }),
    library: t.relation('library', { nullable: false }),
    dropError: t.exposeString('dropError', { nullable: true }),
    originModificationDate: t.expose('originModificationDate', { type: 'DateTime', nullable: true }),
    archivedAt: t.expose('archivedAt', { type: 'DateTime', nullable: true }),

    manifest: t.withAuth({ isLoggedIn: true }).field({
      type: 'DocumentManifest',
      nullable: true,
      resolve: async (file, _args, { workspaceId }) => {
        const fileManifest = await document.get(workspaceId, {
          libraryId: file.libraryId,
          documentId: file.id,
        })
        return fileManifest
      },
    }),
    supportedExtractionMethods: t.field({
      type: ['ExtractionMethod'],
      nullable: { list: false, items: false },
      resolve: (file) => {
        const supportedMethods = getAvailableMethodsForMimeType(file.mimeType)
        return supportedMethods.map((method) => method.extractionMethod)
      },
    }),
    crawler: t.relation('crawledByCrawler', { nullable: true }),
    lastUpdate: t.prismaField({
      type: 'AiLibraryUpdate',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiLibraryUpdate.findFirst({
          ...query,
          where: { fileId: file.id },
          orderBy: { createdAt: 'desc' },
        })
      },
    }),
    chunkCount: t.withAuth({ isLoggedIn: true }).field({
      type: 'Int',
      nullable: true,
      resolve: async (file, _args, { workspaceId }) => {
        const chunkCount = await vectorStore.getChunkCount({
          workspaceId,
          libraryId: file.libraryId,
          fileId: file.id,
        })
        return chunkCount
      },
    }),
    embeddingStatistics: t.withAuth({ isLoggedIn: true }).field({
      type: ['EmbeddingStatistic'],
      nullable: { list: false, items: false },
      resolve: async (file, _args, { workspaceId }) => {
        const stats = await vectorStore.getEmbeddingStatistics({
          workspaceId,
          libraryId: file.libraryId,
          fileId: file.id,
        })
        return stats
      },
    }),
    status: t.field({
      type: 'String',
      nullable: false,
      resolve: (file) => {
        if (file.archivedAt) {
          return 'archived'
        }
        if (file.updatedAt) {
          return 'uploaded'
        }
        if (file.dropError) {
          return 'error'
        }
        return 'pending'
      },
    }),
  }),
})
