import { Stream } from 'stream'

import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'

import { logger } from './common'

export async function saveSourceFile(parameters: {
  workspaceId: string
  libraryId: string
  fileId?: string
  fileUri: string
  mimeType: string
  fileName: string
  crawlerId?: string
  modificationDate?: Date
  stream: AsyncIterable<string> | Stream.Readable | AsyncIterable<string | Buffer<ArrayBufferLike>>
}) {
  logger.info('Saving source file', parameters)

  const { workspaceId, libraryId, fileUri, mimeType, fileName, crawlerId, modificationDate, stream } = parameters

  const result = await prisma.$transaction(async (tx) => {
    const file = await tx.aiLibraryFile.upsert({
      where: { libraryId_originUri: { libraryId, originUri: fileUri } },
      create: {
        name: fileName,
        mimeType: mimeType,
        libraryId,
        originUri: fileUri,
        crawledByCrawlerId: crawlerId,
        originModificationDate: modificationDate,
      },
      update: {}, // Don't update on find - we'll update after hash comparison
      select: { id: true, name: true, originUri: true, mimeType: true, originFileHash: true },
    })
    const newManifest = await workspaceStorage.writeSource(workspaceId, {
      libraryId,
      fileId: file.id,
      stream,
      meta: {
        mimeType: mimeType,
        originalName: fileName,
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: null,
      },
    })
    return { file, newManifest }
  })

  logger.info('Source file saved', {
    parameters,
    result,
  })

  return {
    fileId: result.file.id,
    hash: result.newManifest.sourceHash,
    fileName: result.newManifest.fileName,
    originUri: result.file.originUri,
    mimeType: result.newManifest.mimeType,
  }
}
