import fs from 'fs'
import path from 'path'

import { getFileDir } from '@george-ai/file-management'
import { dateTimeString } from '@george-ai/web-utils'

import { findCacheValue, getAvailableMethodsForMimeType, getFieldValue } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './file-chunks'
import './queries'
import './mutations'

import {
  getLatestExtractionMarkdownFileName,
  getLegacyExtractionFileCount,
  getLegacyExtractionFileNames,
} from '../../domain/file/markdown'

console.log('Setting up: AiLibraryFile')

//TODO: Move to ai-list and remove it here from the file
const FieldValueResult = builder
  .objectRef<{
    fieldId: string
    fieldName: string
    displayValue: string | null
    enrichmentErrorMessage: string | null
    queueStatus: string | null
  }>('FieldValueResult')
  .implement({
    fields: (t) => ({
      fieldId: t.exposeString('fieldId', { nullable: false }),
      fieldName: t.exposeString('fieldName', { nullable: false }),
      displayValue: t.exposeString('displayValue', { nullable: true }),
      enrichmentErrorMessage: t.exposeString('enrichmentErrorMessage', { nullable: true }),
      queueStatus: t.exposeString('queueStatus', { nullable: true }),
    }),
  })

const SourceFileLink = builder.objectRef<{ fileName: string; url: string }>('SourceFileLink').implement({
  fields: (t) => ({
    fileName: t.exposeString('fileName', { nullable: false }),
    url: t.exposeString('url', { nullable: false }),
  }),
})

const AvailableMarkdownsQueryResult = builder
  .objectRef<{
    fileId: string
    libraryId: string
    totalCount: number
    take: number
    skip: number
  }>('AvailableMarkdownsQueryResult')
  .implement({
    fields: (t) => ({
      fileNames: t.field({
        type: ['String'],
        nullable: { list: false, items: true },
        resolve: async (parent) => {
          const markdownFileNamesFromTasks = await prisma.aiFileContentExtractionTask.findMany({
            select: { markdownFileName: true },
            where: { fileId: parent.fileId, extractionFinishedAt: { not: null } },
            orderBy: { extractionFinishedAt: 'desc' },
            take: parent.take,
            skip: parent.skip,
          })
          if (markdownFileNamesFromTasks.length >= parent.take) {
            return markdownFileNamesFromTasks.map((task) => task.markdownFileName!)
          }
          const legacyFileNames = await getLegacyExtractionFileNames({
            fileId: parent.fileId,
            libraryId: parent.libraryId,
          })
          return [
            ...markdownFileNamesFromTasks.map((task) => task.markdownFileName),
            ...legacyFileNames.slice(0, parent.take - markdownFileNamesFromTasks.length),
          ]
        },
      }),
      totalCount: t.exposeInt('totalCount', { nullable: false }),
      take: t.exposeInt('take', { nullable: true }),
      skip: t.exposeInt('skip', { nullable: true }),
    }),
  })

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
    uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
    libraryId: t.exposeString('libraryId', {
      nullable: false,
    }),
    dropError: t.exposeString('dropError', { nullable: true }),
    originModificationDate: t.expose('originModificationDate', { type: 'DateTime', nullable: true }),
    archivedAt: t.expose('archivedAt', { type: 'DateTime', nullable: true }),
    crawledByCrawler: t.relation('crawledByCrawler', { nullable: true }),
    sourceFiles: t.field({
      type: [SourceFileLink],
      nullable: { list: false, items: false },
      resolve: async (file) => {
        const dir = getFileDir({ libraryId: file.libraryId, fileId: file.id })
        if (!fs.existsSync(dir)) {
          return []
        }
        const files = await fs.promises.readdir(dir)
        return files.map((fileName) => ({
          fileName,
          url: process.env.BACKEND_PUBLIC_URL + `/library-files/${file.libraryId}/${file.id}?filename=${fileName}`,
        }))
      },
    }),
    supportedExtractionMethods: t.field({
      type: ['String'],
      nullable: { list: false, items: false },
      resolve: (file) => {
        const supportedMethods = getAvailableMethodsForMimeType(file.mimeType)
        return supportedMethods.map((method) => method.name)
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
    // TODO: Add status type for file status incl. extraction/embedding/file status
    status: t.field({
      type: 'String',
      nullable: false,
      resolve: (file) => {
        if (file.archivedAt) {
          return 'archived'
        }
        if (file.uploadedAt) {
          return 'uploaded'
        }
        if (file.dropError) {
          return 'error'
        }
        return 'pending'
      },
    }),

    taskCount: t.relationCount('contentExtractionTasks', { nullable: false }),
    processingStatus: t.field({
      type: 'ProcessingStatus',
      nullable: false,
      resolve: async (file) => {
        const lastTask = await prisma.aiFileContentExtractionTask.findFirst({
          where: { fileId: file.id },
          orderBy: { createdAt: 'desc' },
        })
        if (!lastTask) {
          return 'none'
        }
        // Check in order of specificity (most specific first)
        if (lastTask.processingTimeout) return 'timedOut'
        if (lastTask.embeddingFailedAt) return 'embeddingFailed'
        if (lastTask.embeddingFinishedAt) return 'embeddingFinished'
        if (lastTask.embeddingStartedAt) return 'embedding'
        if (lastTask.extractionFailedAt) return 'extractionFailed'
        if (lastTask.extractionFinishedAt) return 'extractionFinished'
        if (lastTask.extractionStartedAt) return 'extracting'
        if (lastTask.processingFailedAt) return 'validationFailed'
        if (lastTask.processingFinishedAt) return 'completed'
        if (lastTask.processingStartedAt) return 'validating'
        return 'pending'
      },
    }),

    extractionStatus: t.field({
      type: 'ExtractionStatus',
      nullable: false,
      resolve: async (file) => {
        const lastTask = await prisma.aiFileContentExtractionTask.findFirst({
          where: { fileId: file.id },
          orderBy: { extractionStartedAt: 'desc' },
        })
        if (!lastTask) {
          return 'none'
        }
        if (lastTask.extractionFailedAt) return 'failed'
        if (lastTask.extractionFinishedAt) return 'completed'
        if (lastTask.extractionStartedAt) return 'running'
        return 'pending'
      },
    }),

    lastExtraction: t.prismaField({
      type: 'AiFileContentExtractionTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiFileContentExtractionTask.findFirst({
          ...query,
          where: { fileId: file.id, extractionStartedAt: { not: null } },
          orderBy: { extractionStartedAt: 'desc' },
        })
      },
    }),

    lastSuccessfulExtraction: t.prismaField({
      type: 'AiFileContentExtractionTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiFileContentExtractionTask.findFirst({
          ...query,
          where: { fileId: file.id, extractionFinishedAt: { not: null } },
          orderBy: { extractionFinishedAt: 'desc' },
        })
      },
    }),

    embeddingStatus: t.field({
      type: 'EmbeddingStatus',
      nullable: false,
      resolve: async (file) => {
        const lastTask = await prisma.aiFileContentExtractionTask.findFirst({
          where: { fileId: file.id },
          orderBy: { embeddingStartedAt: 'desc' },
        })
        if (!lastTask) {
          return 'none'
        }
        if (lastTask.embeddingFailedAt) return 'failed'
        if (lastTask.embeddingFinishedAt) return 'completed'
        if (lastTask.embeddingStartedAt) return 'running'
        return 'pending'
      },
    }),

    lastEmbedding: t.prismaField({
      type: 'AiFileContentExtractionTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiFileContentExtractionTask.findFirst({
          ...query,
          where: { fileId: file.id, embeddingStartedAt: { not: null } },
          orderBy: { embeddingStartedAt: 'desc' },
        })
      },
    }),

    lastSuccessfulEmbedding: t.prismaField({
      type: 'AiFileContentExtractionTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiFileContentExtractionTask.findFirst({
          ...query,
          where: { fileId: file.id, embeddingFinishedAt: { not: null } },
          orderBy: { embeddingFinishedAt: 'desc' },
        })
      },
    }),

    isLegacyFile: t.field({
      type: 'Boolean',
      nullable: false,
      resolve: async (file) => {
        // A legacy file is one that does not have any content extraction tasks
        const count = await prisma.aiFileContentExtractionTask.count({
          where: { fileId: file.id, extractionFinishedAt: { not: null } },
        })

        if (count > 0) {
          return false
        }

        const fileDir = getFileDir({ fileId: file.id, libraryId: file.libraryId })
        const allFiles = await fs.promises.readdir(fileDir)
        const allMarkdownFiles = allFiles.filter((file) => file.endsWith('.md'))
        if (allMarkdownFiles.some((file) => file.startsWith('converted'))) {
          return true
        }

        return false
      },
    }),
    availableExtractionMarkdowns: t.field({
      type: AvailableMarkdownsQueryResult,
      nullable: false,
      args: {
        take: t.arg.int({ required: false, defaultValue: 20 }),
        skip: t.arg.int({ required: false, defaultValue: 0 }),
      },
      resolve: async (file, { take, skip }) => {
        const totalCountTasks = await prisma.aiFileContentExtractionTask.count({
          where: { fileId: file.id, extractionFinishedAt: { not: null } },
        })
        const totalCountLegacies = await getLegacyExtractionFileCount({ fileId: file.id, libraryId: file.libraryId })
        return {
          fileId: file.id,
          libraryId: file.libraryId,
          totalCount: totalCountTasks + totalCountLegacies,
          take: take || 20,
          skip: skip || 0,
        }
      },
    }),
    latesExtractionMarkdownFileName: t.field({
      type: 'String',
      nullable: true,
      resolve: async (file) => {
        // Get the latest successful extraction task
        const extractionTask = await prisma.aiFileContentExtractionTask.findFirst({
          where: { fileId: file.id, extractionFinishedAt: { not: null } },
          orderBy: { extractionFinishedAt: 'desc' },
        })

        if (extractionTask) {
          if (!extractionTask.markdownFileName) {
            throw new Error('The uploaded file is missing but extraction task was found.')
          }
          return extractionTask.markdownFileName
        }

        const fileDir = getFileDir({ fileId: file.id, libraryId: file.libraryId })
        const allFiles = await fs.promises.readdir(fileDir)
        const allMarkdownFiles = allFiles
          .filter((file) => file.endsWith('.md') && file.startsWith('converted'))
          .sort((a, b) => b.localeCompare(a))
          .reverse()
        if (allMarkdownFiles.length === 0) {
          return null
        }
        return allMarkdownFiles[0]
      },
    }),
    markdown: t.field({
      type: 'String',
      nullable: false,
      args: {
        markdownFileName: t.arg.string({ required: false }),
      },
      resolve: async (file, { markdownFileName }) => {
        if (!markdownFileName) {
          markdownFileName = await getLatestExtractionMarkdownFileName({ fileId: file.id, libraryId: file.libraryId })
          if (!markdownFileName) {
            throw new Error('The uploaded file is missing.')
          }
        }
        const fileDir = getFileDir({ fileId: file.id, libraryId: file.libraryId })
        const filePath = path.resolve(fileDir, markdownFileName)
        return await fs.promises.readFile(filePath, 'utf-8')
      },
    }),

    cache: t.relation('cache', { nullable: false }),
    //TODO: Move it to aiList and remove it here from the file
    fieldValues: t.field({
      type: [FieldValueResult],
      nullable: { list: false, items: false },
      args: {
        fieldIds: t.arg.stringList({ required: true }),
        language: t.arg.string({ required: true }),
      },
      resolve: async (file, { fieldIds, language }) => {
        // Get all field definitions with their associated lists
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: fieldIds } },
          include: {
            list: {
              include: { participants: true },
            },
          },
        })

        // Get file with required relations
        const fileWithRelations = await prisma.aiLibraryFile.findUnique({
          where: { id: file.id },
          include: {
            crawledByCrawler: true,
            cache: true,
          },
        })
        if (!fileWithRelations) {
          return fieldIds.map((fieldId) => {
            const field = fields.find((f) => f.id === fieldId)
            return {
              fieldId,
              fieldName: field?.name || 'Unknown',
              displayValue: null,
              enrichmentErrorMessage: null,
              queueStatus: null,
            }
          })
        }

        // Process all fields at once, maintaining order
        const results = []
        for (const fieldId of fieldIds) {
          const field = fields.find((f) => f.id === fieldId)
          if (!field) {
            results.push({
              fieldId,
              fieldName: 'Unknown',
              displayValue: null,
              enrichmentErrorMessage: null,
              queueStatus: null,
            })
            continue
          }

          const cache = findCacheValue(fileWithRelations, fieldId)
          const { value: computedValue, errorMessage } = await getFieldValue(fileWithRelations, field, cache)

          // Check queue status for this file-field combination
          let queueStatus: string | null = null
          if (field.sourceType === 'llm_computed' && !computedValue && !errorMessage) {
            const queueItem = await prisma.aiListEnrichmentQueue.findFirst({
              where: {
                fieldId: fieldId,
                fileId: file.id,
                status: { in: ['pending', 'processing'] },
              },
              orderBy: { requestedAt: 'desc' },
            })
            queueStatus = queueItem?.status || null
          }

          // Format display value based on field type
          let displayValue = computedValue
          if (computedValue) {
            // Handle date formatting
            if (
              field.type === 'date' ||
              field.type === 'datetime' ||
              field.fileProperty === 'processedAt' ||
              field.fileProperty === 'originModificationDate'
            ) {
              try {
                displayValue = dateTimeString(computedValue, language)
              } catch {
                displayValue = computedValue
              }
            }
            // Handle boolean formatting
            else if (field.type === 'boolean' && field.sourceType === 'llm_computed') {
              // Already formatted as Yes/No in getFieldValue
              displayValue = computedValue
            }
          }

          results.push({
            fieldId,
            fieldName: field.name,
            displayValue,
            enrichmentErrorMessage: errorMessage,
            queueStatus,
          })
        }

        return results
      },
    }),
  }),
})
