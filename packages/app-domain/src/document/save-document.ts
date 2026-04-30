import { Readable } from 'node:stream'

import { prisma } from '@george-ai/app-database'
import { DocumentManifest, document } from '@george-ai/file-management'

export async function saveDocument(
  workspaceId: string,
  params: {
    libraryId: string
    uri: string
    name: string
    mimeType: string
    crawlerId?: string
    modificationDate?: Date
    sourceStream?: Readable
    originalFileHash?: string
    author?: string
  },
): Promise<DocumentManifest> {
  const file = await prisma?.aiLibraryFile.upsert({
    create: {
      libraryId: params.libraryId,
      name: params.name,
      originUri: params.uri,
      mimeType: params.mimeType,
      ...(params.crawlerId ? { crawledByCrawlerId: params.crawlerId } : {}),
      ...(params.modificationDate ? { originModificationDate: params.modificationDate } : {}),
      ...(params.originalFileHash ? { originFileHash: params.originalFileHash } : {}),
    },
    update: {
      name: params.name,
      mimeType: params.mimeType,
      ...(params.crawlerId ? { crawledByCrawlerId: params.crawlerId } : {}),
      ...(params.modificationDate ? { originModificationDate: params.modificationDate } : {}),
      ...(params.originalFileHash ? { originFileHash: params.originalFileHash } : {}),
      ...(params.author ? { author: params.author } : {}),
    },
    where: { libraryId_originUri: { libraryId: params.libraryId, originUri: params.uri } },
    select: { id: true },
  })

  let manifest = await document.get({ workspaceId, libraryId: params.libraryId, documentId: file.id })

  if (!manifest) {
    manifest = await document.create(workspaceId, {
      libraryId: params.libraryId,
      name: params.name,
      uri: params.uri,
      mimeType: params.mimeType,
      documentId: file.id,
      ...(params.author ? { creator: params.author } : {}),
      ...(params.originalFileHash ? { originHash: params.originalFileHash } : {}),
    })
  } else {
    manifest = await document.save(workspaceId, {
      libraryId: params.libraryId,
      documentId: file.id,
      name: params.name,
      mimeType: params.mimeType,
      origin: {
        uri: params.uri,
        lastModifiedDate: params.modificationDate,
        author: params.author,
        originHash: params.originalFileHash,
      },
    })
  }

  if (!params.sourceStream) {
    return manifest
  }

  const writer = await document.writeSource(workspaceId, {
    ...manifest,
    stream: params.sourceStream,
  })

  return await writer.ack()
}
