import { prisma } from '@george-ai/app-database'

import { builder } from '../builder'

import './queries'
import './mutations'

import { ExtractionMethodSchema } from '@george-ai/app-schema'
import { document, extraction } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from '../common'

logger.info('Setting up: AiList')

builder.prismaObject('AiListSource', {
  name: 'AiListSource',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    libraryId: t.exposeString('libraryId'),
    library: t.relation('library', { nullable: true }),
  }),
})

builder.prismaObject('AiList', {
  name: 'AiList',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    name: t.exposeString('name', { nullable: false }),
    fields: t.relation('fields', { nullable: false, query: { orderBy: { order: 'asc' } } }),
    sources: t.relation('sources', { nullable: false }),
    enrichmentTasks: t.relation('enrichmentTasks', { nullable: false }),
  }),
})

builder.prismaObject('AiListItem', {
  name: 'AiListItem',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    sourceId: t.exposeString('sourceId', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    extractionMethod: t.field({
      type: 'ExtractionMethod',
      nullable: true,
      resolve: (item) => ExtractionMethodSchema.parse(item.extractionMethod),
    }),
    fragment: t.exposeInt('fragment'),
    itemName: t.exposeString('itemName', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    source: t.relation('source', { nullable: false }),
    file: t.relation('file', { nullable: false }),
    fileInfo: t.withAuth({ isLoggedIn: true }).field({
      type: 'DocumentManifest',
      nullable: true,
      resolve: async (item, _args, { workspaceId }) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.fileId },
          select: { libraryId: true },
        })
        return document.get({ workspaceId, libraryId: sourceFile.libraryId, documentId: item.fileId })
      },
    }),
    extractionInfo: t.withAuth({ isLoggedIn: true }).field({
      type: 'ExtractionManifest',
      nullable: true,
      resolve: async (item, _args, { workspaceId }) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.fileId },
          select: { libraryId: true },
        })
        const extractionMethod = ExtractionMethodSchema.parse(item.extractionMethod)
        if (!extractionMethod) {
          return null
        }

        const extractionInfo = await extraction.get(workspaceId, {
          libraryId: sourceFile.libraryId,
          documentId: item.fileId,
          extractionMethod,
        })
        return extractionInfo
      },
    }),
    chunkCount: t.withAuth({ isLoggedIn: true }).field({
      type: 'Int',
      nullable: true,
      resolve: async (item, _args, { workspaceId }) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.fileId },
          select: { libraryId: true },
        })
        const count = await vectorStore.getChunkCount({
          workspaceId,
          libraryId: sourceFile.libraryId,
          fileId: item.fileId,
        })
        return count
      },
    }),
  }),
})
