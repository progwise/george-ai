import { prisma } from '@george-ai/app-database'
import { getAvailableMethodsForMimeType } from '@george-ai/file-converter'

import { ExtractionInfo } from '../ai-content-extraction'
import { builder } from '../builder'

import './file-chunks'
import './file-usages'
import './queries'
import './mutations'

import { GraphQLError } from 'graphql/error'

import { ExtractionMetadata, workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from './common'

logger.info('Setting up: AiLibraryFile')

builder.prismaObject('AiLibraryFile', {
  name: 'AiLibraryFile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    storageStatus: t.withAuth({ isLoggedIn: true }).field({
      type: 'StorageStatus',
      nullable: false,
      resolve: async (file, _args, { workspaceId }) => {
        const storageStatus = await workspaceStorage.getStorageStatus(workspaceId, {
          libraryId: file.libraryId,
          fileId: file.id,
        })
        return storageStatus
      },
    }),
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
    embeddingInfo: t.withAuth({ isLoggedIn: true }).field({
      type: [
        builder.simpleObject('FileEmbeddingInfo', {
          description: 'Information about embeddings available for a file',
          fields: (t) => ({
            extractionMethod: t.field({ type: 'ExtractionMethod', nullable: false }),
            modelName: t.string({ nullable: false }),
            chunkCount: t.int({ nullable: false }),
          }),
        }),
      ],
      nullable: { list: true, items: false },
      resolve: async (file, _args, { workspaceId }) => {
        try {
          const embeddingInfo = await vectorStore.getEmbeddingInfo({
            workspaceId,
            libraryId: file.libraryId,
            fileId: file.id,
          })
          return embeddingInfo
        } catch (error) {
          logger.error('Error fetching file embeddings info', {
            error,
            workspaceId,
            fileId: file.id,
            libraryId: file.libraryId,
          })
          throw new GraphQLError('Failed to fetch file embeddings info', { originalError: error as Error })
        }
      },
    }),
    fileInfo: t.withAuth({ isLoggedIn: true }).field({
      type: 'FileManifest',
      nullable: true,
      resolve: async (file, _args, { workspaceId }) => {
        const fileInfo = await workspaceStorage.getFile(workspaceId, {
          libraryId: file.libraryId,
          fileId: file.id,
        })
        return fileInfo
      },
    }),
    extractions: t.withAuth({ isLoggedIn: true }).field({
      type: [ExtractionInfo],
      nullable: { list: false, items: false },
      description: 'Available extractions for this file (e.g., CSV, PDF with different models)',
      resolve: async (file, _args, { workspaceId }) => {
        const fileInfo = await workspaceStorage.getFile(workspaceId, {
          libraryId: file.libraryId,
          fileId: file.id,
        })

        if (!fileInfo) {
          logger.error('File not found in storage when fetching available extractions', {
            workspaceId,
            fileId: file.id,
            libraryId: file.libraryId,
          })
          throw new GraphQLError(`File not found in storage: ${file.id}`)
        }

        const extractionInfos = await Promise.all(
          fileInfo.extractions.map(async (extraction) =>
            workspaceStorage.getExtraction(workspaceId, {
              libraryId: file.libraryId,
              fileId: file.id,
              extractionMethod: extraction.extractionMethod,
            }),
          ),
        )

        // Add mainFileUrl to each extraction
        return extractionInfos.filter((info): info is ExtractionMetadata => info !== null)
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
  }),
})
