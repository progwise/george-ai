import { prisma } from '@george-ai/app-database'
import { LibraryManifest, migrate } from '@george-ai/file-management'

import { logger } from './common'

export async function migrateLibrary(parameters: { workspaceId: string; libraryId: string }): Promise<LibraryManifest> {
  const { workspaceId, libraryId } = parameters

  const libraryEntity = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId, workspaceId },
    select: { id: true, name: true, embeddingModel: true, createdAt: true, updatedAt: true },
  })

  const libraryManifest = await migrate.migrateLibrary(workspaceId, {
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

  return libraryManifest
}
