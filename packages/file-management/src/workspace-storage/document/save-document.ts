import entry from '../entry'
import { DocumentManifest } from '../schema'

export async function saveDocument(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentId: string
    name?: string
    mimeType?: string
    origin?: {
      author?: string
      uri?: string
      creationDate?: Date
      originHash?: string
      lastModifiedDate?: Date
    }
  },
): Promise<DocumentManifest> {
  const { name, mimeType, origin } = parameters
  const existingManifest = await entry.getEntryOrThrow({
    workspaceId,
    libraryId: parameters.libraryId,
    documentId: parameters.documentId,
    type: 'document',
    version: 1,
  })

  return await entry.saveEntry({
    ...existingManifest,
    name: name || existingManifest.name,
    mimeType: mimeType || existingManifest.mimeType,
    origin: {
      author: origin?.author || existingManifest.origin.author,
      uri: origin?.uri || existingManifest.origin.uri,
      creationDate: origin?.creationDate || existingManifest.origin.creationDate,
      hash: origin?.originHash || existingManifest.origin.hash,
      lastModifiedDate: origin?.lastModifiedDate || existingManifest.origin.lastModifiedDate,
    },
    updated: new Date(),
  })
}
