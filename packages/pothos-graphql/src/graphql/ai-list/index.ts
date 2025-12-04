import { readListItemContent } from '@george-ai/file-management'

import { getFileMarkdownContent } from '../../domain/list/item-extraction'
import { prisma } from '../../prisma'
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
    metadata: t.string({
      nullable: true,
      resolve: (item) => (item.metadata ? JSON.stringify(item.metadata) : null),
    }),
    list: t.relation('list', { nullable: false }),
    source: t.relation('source', { nullable: false }),
    sourceFile: t.relation('sourceFile', { nullable: false }),
    /**
     * Content is loaded from file system:
     * - per_file (extractionIndex is null): Uses source file's markdown
     * - per_row (extractionIndex is set): Reads from listItems/<listId>/<itemId>.md
     */
    content: t.field({
      type: 'String',
      nullable: true,
      resolve: async (item) => {
        // per_file: use source file's markdown directly
        if (item.extractionIndex === null) {
          // Need to get libraryId from source file
          const sourceFile = await prisma.aiLibraryFile.findUnique({
            where: { id: item.sourceFileId },
            select: { libraryId: true },
          })
          if (!sourceFile) return null
          return getFileMarkdownContent(item.sourceFileId, sourceFile.libraryId)
        }

        // per_row: read from .md file
        const sourceFile = await prisma.aiLibraryFile.findUnique({
          where: { id: item.sourceFileId },
          select: { libraryId: true },
        })
        if (!sourceFile) return null

        return readListItemContent({
          fileId: item.sourceFileId,
          libraryId: sourceFile.libraryId,
          listId: item.listId,
          itemId: item.id,
        })
      },
    }),
  }),
})
