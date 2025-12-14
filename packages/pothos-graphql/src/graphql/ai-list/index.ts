import fs from 'fs'
import path from 'node:path'

import { getBucketPath } from '@george-ai/file-management'

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
    itemName: t.exposeString('itemName', { nullable: false }),
    metadata: t.string({
      nullable: true,
      resolve: (item) => (item.metadata ? JSON.stringify(item.metadata) : null),
    }),
    list: t.relation('list', { nullable: false }),
    source: t.relation('source', { nullable: false }),
    sourceFile: t.relation('sourceFile', { nullable: false }),
    /**
     * Content is loaded from file system:
     * - extractionIndex is null: Uses source file's whole markdown
     * - extractionIndex is set: Reads from bucketed part file
     */
    content: t.field({
      type: 'String',
      nullable: true,
      resolve: async (item) => {
        // Get libraryId from source file
        const sourceFile = await prisma.aiLibraryFile.findUnique({
          where: { id: item.sourceFileId },
          select: { libraryId: true },
        })
        if (!sourceFile) return null

        // Whole file: use source file's markdown directly
        if (item.extractionIndex === null) {
          return getFileMarkdownContent(item.sourceFileId, sourceFile.libraryId)
        }

        // Bucketed file: read from part file
        // Extract extraction method info from metadata
        const metadata = item.metadata as Record<string, unknown> | null
        const extractionMethod = metadata?.extractionMethod as string | undefined
        const extractionMethodParameter = metadata?.extractionMethodParameter as string | undefined

        if (!extractionMethod) {
          // Fallback to whole file if metadata is missing
          return getFileMarkdownContent(item.sourceFileId, sourceFile.libraryId)
        }

        try {
          const bucketPath = getBucketPath({
            libraryId: sourceFile.libraryId,
            fileId: item.sourceFileId,
            extractionMethod,
            extractionMethodParameter,
            part: item.extractionIndex,
          })
          const partFileName = `part-${item.extractionIndex.toString().padStart(7, '0')}.md`
          const partFilePath = path.join(bucketPath, partFileName)
          return await fs.promises.readFile(partFilePath, 'utf-8')
        } catch (error) {
          console.error(`Failed to read part ${item.extractionIndex} for file ${item.sourceFileId}:`, error)
          return null
        }
      },
    }),
  }),
})
