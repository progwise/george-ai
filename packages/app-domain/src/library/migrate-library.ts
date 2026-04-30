import { prisma } from '@george-ai/app-database'
import { MigrateFileRequest, publish } from '@george-ai/event-service-client'
import { LibraryManifest, migrate } from '@george-ai/file-management'

import { logger } from './common'

export async function migrateLibrary(parameters: {
  workspaceId: string
  libraryId: string
}): Promise<{ library: LibraryManifest; fileMigrationsPublished: number }> {
  const { workspaceId, libraryId } = parameters

  const libraryEntity = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId, workspaceId },
    select: { id: true, name: true, embeddingModel: true, createdAt: true, updatedAt: true },
  })

  const { libraryManifest, legacyFileInfos } = await migrate.migrateLibrary(workspaceId, {
    libraryId,
    libraryName: libraryEntity.name,
    fileInfoLoader: async (fileId: string) => {
      const fileInfo = await prisma.aiLibraryFile.findUnique({
        where: { id: fileId },
        select: {
          libraryId: true,
          id: true,
          name: true,
          mimeType: true,
          createdAt: true,
          originFileHash: true,
          originUri: true,
          crawledByCrawlerId: true,
          updatedAt: true,
          originModificationDate: true,
        },
      })

      if (!fileInfo) {
        logger.warn('File info not found during migration - skipping', { workspaceId, fileId })
        return null
      }
      return {
        workspaceId,
        libraryId: fileInfo.libraryId,
        fileId,
        name: fileInfo.name,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt.toISOString(),
        originUri: fileInfo.originUri,
        originFileHash: fileInfo.originFileHash,
        crawledByCrawlerId: fileInfo.crawledByCrawlerId,
        updatedAt: fileInfo.updatedAt.toISOString(),
        originModificationDate: fileInfo.originModificationDate?.toISOString() ?? null,
      }
    },
  })

  for (const legacyFileInfo of legacyFileInfos) {
    const request: MigrateFileRequest = {
      version: 1,
      action: 'migrateFile',
      workspaceId,
      libraryId,
      fileId: legacyFileInfo.fileId,
      fileName: legacyFileInfo.name,
      mimeType: legacyFileInfo.mimeType,
      originUri: legacyFileInfo.originUri ?? undefined,
      crawledByCrawlerId: legacyFileInfo.crawledByCrawlerId ?? undefined,
      docPath: legacyFileInfo.docPath ?? undefined,
      originFileHash: legacyFileInfo.originFileHash ?? undefined,
      originModificationDate: legacyFileInfo.originModificationDate ?? undefined,
      createdAt: legacyFileInfo.createdAt,
      uploadedAt: legacyFileInfo.uploadedAt ?? undefined,
      hash: legacyFileInfo.hash ?? undefined,
      verb: 'request',
      timestamp: new Date(),
    }
    logger.debug('Emitting migrate file event for migrated library', {
      workspaceId,
      libraryId,
      fileId: legacyFileInfo.fileId,
    })

    await publish(request)
  }

  return { library: libraryManifest, fileMigrationsPublished: legacyFileInfos.length }
}
