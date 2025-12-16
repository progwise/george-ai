import {
  getAvailableExtractions,
  getAvailableExtractionsWithInfo,
  getExtractionFileInfo,
} from '@george-ai/file-management'
import { getFileChunkCount } from '@george-ai/langchain-chat'

import { BACKEND_PUBLIC_URL } from '../../global-config'
import { prisma } from '../../prisma'
import { ExtractionInfo } from '../ai-content-extraction'
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

    availableExtractions: t.field({
      type: [ExtractionInfo],
      nullable: { list: false, items: false },
      description: 'Available extractions for the source file of this list item',
      resolve: async (item) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.sourceFileId },
          select: { id: true, libraryId: true },
        })

        const extractionInfos = await getAvailableExtractionsWithInfo({
          fileId: sourceFile.id,
          libraryId: sourceFile.libraryId,
        })

        // Add mainFileUrl to each extraction
        return extractionInfos.map((info) => ({
          ...info,
          mainFileUrl:
            BACKEND_PUBLIC_URL +
            `/library-files/${sourceFile.libraryId}/${sourceFile.id}?filename=${info.mainFileName}`,
        }))
      },
    }),

    extraction: t.field({
      type: ExtractionInfo,
      nullable: true,
      description: 'The extraction this list item uses (based on what exists in file system)',
      resolve: async (item) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.sourceFileId },
          select: { id: true, libraryId: true },
        })

        // Get what actually exists in file system
        const availableExtractions = await getAvailableExtractions({
          fileId: sourceFile.id,
          libraryId: sourceFile.libraryId,
        })

        if (availableExtractions.length === 0) {
          return null
        }

        // If item has extractionIndex (is a part), find the bucketed extraction
        // Otherwise, find the unbucketed extraction
        const hasPart = item.extractionIndex !== null && item.extractionIndex !== undefined

        // Check each extraction to find the right one (bucketed vs unbucketed)
        for (const ext of availableExtractions) {
          const info = await getExtractionFileInfo({
            fileId: sourceFile.id,
            libraryId: sourceFile.libraryId,
            extractionMethod: ext.extractionMethod,
            extractionMethodParameter: ext.extractionMethodParameter || undefined,
          })

          if (!info) continue

          // If item is a part, use bucketed extraction
          // If item is whole file, use unbucketed extraction
          if ((hasPart && info.isBucketed) || (!hasPart && !info.isBucketed)) {
            const mainName =
              ext.extractionMethod + (ext.extractionMethodParameter ? `_${ext.extractionMethodParameter}` : '')
            const mainFileName = `${mainName}.md`

            return {
              extractionMethod: ext.extractionMethod,
              extractionMethodParameter: ext.extractionMethodParameter || null,
              totalParts: info.totalParts,
              totalSize: info.totalSize,
              isBucketed: info.isBucketed,
              mainFileUrl:
                BACKEND_PUBLIC_URL + `/library-files/${sourceFile.libraryId}/${sourceFile.id}?filename=${mainFileName}`,
            }
          }
        }

        // Fallback: use first available extraction if no match found
        const fallbackExtraction = availableExtractions[0]
        const fallbackInfo = await getExtractionFileInfo({
          fileId: sourceFile.id,
          libraryId: sourceFile.libraryId,
          extractionMethod: fallbackExtraction.extractionMethod,
          extractionMethodParameter: fallbackExtraction.extractionMethodParameter || undefined,
        })

        if (!fallbackInfo) {
          return null
        }

        const mainName =
          fallbackExtraction.extractionMethod +
          (fallbackExtraction.extractionMethodParameter ? `_${fallbackExtraction.extractionMethodParameter}` : '')
        const mainFileName = `${mainName}.md`

        return {
          extractionMethod: fallbackExtraction.extractionMethod,
          extractionMethodParameter: fallbackExtraction.extractionMethodParameter || null,
          totalParts: fallbackInfo.totalParts,
          totalSize: fallbackInfo.totalSize,
          isBucketed: fallbackInfo.isBucketed,
          mainFileUrl:
            BACKEND_PUBLIC_URL + `/library-files/${sourceFile.libraryId}/${sourceFile.id}?filename=${mainFileName}`,
        }
      },
    }),

    contentUrl: t.string({
      nullable: false,
      description: 'URL to fetch the markdown content for this list item from the backend',
      resolve: async (item) => {
        const sourceFile = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: item.sourceFileId },
          select: { id: true, libraryId: true },
        })

        // Get what actually exists in file system
        const availableExtractions = await getAvailableExtractions({
          fileId: sourceFile.id,
          libraryId: sourceFile.libraryId,
        })

        // Determine which extraction to use based on whether this item is a part
        const hasPart = item.extractionIndex !== null && item.extractionIndex !== undefined
        let extraction: { extractionMethod: string; extractionMethodParameter: string | null } | null = null

        // Find the right extraction (bucketed for parts, unbucketed for whole files)
        for (const ext of availableExtractions) {
          const info = await getExtractionFileInfo({
            fileId: sourceFile.id,
            libraryId: sourceFile.libraryId,
            extractionMethod: ext.extractionMethod,
            extractionMethodParameter: ext.extractionMethodParameter || undefined,
          })

          if (!info) continue

          // If item is a part, use bucketed extraction
          // If item is whole file, use unbucketed extraction
          if ((hasPart && info.isBucketed) || (!hasPart && !info.isBucketed)) {
            extraction = {
              extractionMethod: ext.extractionMethod,
              extractionMethodParameter: ext.extractionMethodParameter || null,
            }
            break
          }
        }

        // Fallback: use first available extraction, or markdown-extraction
        if (!extraction) {
          extraction = availableExtractions[0] || {
            extractionMethod: 'markdown-extraction',
            extractionMethodParameter: null,
          }
        }

        // Build filename from extraction method and parameter
        const mainName =
          extraction.extractionMethod +
          (extraction.extractionMethodParameter ? `_${extraction.extractionMethodParameter}` : '')
        const mainFileName = `${mainName}.md`

        // Build the base URL
        const baseUrl = `${BACKEND_PUBLIC_URL}/library-files/${sourceFile.libraryId}/${sourceFile.id}?filename=${mainFileName}`

        // Add part parameter if this item has an extraction index
        if (item.extractionIndex !== null && item.extractionIndex !== undefined) {
          return `${baseUrl}&part=${item.extractionIndex}`
        }

        return baseUrl
      },
    }),
  }),
})
