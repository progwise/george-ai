import { logger } from '../commons'
import { createEntry, entryExists, getEntryOrThrow } from '../entry'
import { DocumentIdentifier, DocumentManifest, StorageStatsSchema } from '../schema'
import { updateStats } from '../storage-stats'

export async function createDocument(
  workspaceId: string,
  args: {
    documentId: string
    libraryId: string
    name: string
    mimeType: string
    uri: string
    creationDate?: Date
    lastModifiedDate?: Date
    creator?: string
    originHash?: string
  },
): Promise<DocumentManifest> {
  const { libraryId, documentId } = args
  const identifier: DocumentIdentifier = { workspaceId, libraryId, documentId, version: 1, type: 'document' }
  const libraryManifest = await getEntryOrThrow(
    { ...identifier, type: 'library' },
    `Library manifest not found for library ${libraryId} in workspace ${workspaceId}`,
  )

  const documentExists = await entryExists(identifier)
  if (documentExists) {
    logger.error('Cannot create document because document already exists', identifier)
    throw new Error(
      `Document with id ${identifier.documentId} already exists in library ${identifier.libraryId} in workspace ${identifier.workspaceId}`,
    )
  }

  const documentManifest: DocumentManifest = {
    version: 1,
    documentId: identifier.documentId,
    name: args.name,
    created: new Date(),
    storageStats: StorageStatsSchema.parse({}),
    mimeType: args.mimeType,
    creator: args.creator,
    extractions: [],
    origin: {
      uri: args.uri,
      creationDate: args.creationDate,
      lastModifiedDate: args.lastModifiedDate,
      author: args.creator,
      hash: args.originHash,
    },
    libraryId: identifier.libraryId,
    workspaceId: identifier.workspaceId,
    attachments: [],
    analyses: [],
    type: 'document',
  }

  const savedDocumentManifest = await createEntry(documentManifest)

  await updateStats(libraryManifest, {
    stats: savedDocumentManifest.storageStats,
    operation: 'add',
  })
  return savedDocumentManifest
}
