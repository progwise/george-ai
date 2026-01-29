import { prisma } from '@george-ai/app-domain'
import { getFileChunkCount } from '@george-ai/langchain-chat'

import { builder } from '../builder'

import './queries'
import './mutations'

console.log('Setting up: AiList')

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
    ownerId: t.exposeString('ownerId', { nullable: false }),
    owner: t.relation('owner', { nullable: false }),
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
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    sourceId: t.exposeString('sourceId', { nullable: false }),
    sourceFileId: t.exposeString('sourceFileId', { nullable: false }),
    extractionIndex: t.exposeInt('extractionIndex'),
    itemName: t.exposeString('itemName', { nullable: false }),
    metadata: t.string({
      nullable: true,
      resolve: (item) => (item.metadata ? JSON.stringify(item.metadata) : null),
    }),
    list: t.relation('list', { nullable: false }),
    source: t.relation('source', { nullable: false }),
    sourceFile: t.relation('sourceFile', { nullable: false }),

    chunkCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async (item) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.sourceFileId },
          select: { libraryId: true },
        })
        const count = await getFileChunkCount(
          sourceFile.libraryId,
          item.sourceFileId,
          item.extractionIndex === null ? undefined : item.extractionIndex,
        )
        return count
      },
    }),
  }),
})
