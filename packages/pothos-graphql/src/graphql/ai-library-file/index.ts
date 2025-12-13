import fs from 'fs'

import { getAvailableMethodsForMimeType } from '@george-ai/file-converter'
import { getFileDir } from '@george-ai/file-management'

import { BACKEND_PUBLIC_URL } from '../../global-config'
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './file-chunks'
import './queries'
import './mutations'

import {
  getExistingExtractionMarkdownFileNames,
  getLatestExtractionMarkdownFileNames,
} from '../../domain/file/markdown'

console.log('Setting up: AiLibraryFile')

const SourceFileLink = builder.objectRef<{ fileName: string; url: string }>('SourceFileLink').implement({
  fields: (t) => ({
    fileName: t.exposeString('fileName', { nullable: false }),
    url: t.exposeString('url', { nullable: false }),
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
    library: t.relation('library', { nullable: false }),
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
          url: BACKEND_PUBLIC_URL + `/library-files/${file.libraryId}/${file.id}?filename=${fileName}`,
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
        const lastTask = await prisma.aiContentProcessingTask.findFirst({
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
        const lastTask = await prisma.aiContentProcessingTask.findFirst({
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
      type: 'AiContentProcessingTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiContentProcessingTask.findFirst({
          ...query,
          where: { fileId: file.id, extractionStartedAt: { not: null } },
          orderBy: { extractionStartedAt: 'desc' },
        })
      },
    }),

    lastSuccessfulExtraction: t.prismaField({
      type: 'AiContentProcessingTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiContentProcessingTask.findFirst({
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
        const lastTask = await prisma.aiContentProcessingTask.findFirst({
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
      type: 'AiContentProcessingTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiContentProcessingTask.findFirst({
          ...query,
          where: { fileId: file.id, embeddingStartedAt: { not: null } },
          orderBy: { embeddingStartedAt: 'desc' },
        })
      },
    }),

    lastSuccessfulEmbedding: t.prismaField({
      type: 'AiContentProcessingTask',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiContentProcessingTask.findFirst({
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
        const count = await prisma.aiContentProcessingTask.count({
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
    availableExtractionMarkdownFileNames: t.field({
      type: ['String'],
      nullable: false,
      resolve: async (file) => {
        return getExistingExtractionMarkdownFileNames({ fileId: file.id, libraryId: file.libraryId })
      },
    }),
    latestExtractionMarkdownFileNames: t.field({
      type: ['String'],
      nullable: { list: false, items: false },
      resolve: async (file) => {
        return await getLatestExtractionMarkdownFileNames({ fileId: file.id, libraryId: file.libraryId })
      },
    }),
  }),
})
