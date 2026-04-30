import { prisma } from '@george-ai/app-database'
import { DocumentManifest, createDocument, existsLibrary, getDocument } from '@george-ai/file-management'

import { logger } from '../common'
import { fixMissingLibraryManifest } from '../library'

export async function fixMissingDocumentManifest(documentId: string): Promise<DocumentManifest> {
  const file = await prisma.aiLibraryFile.findFirstOrThrow({
    where: { id: documentId },
    include: {
      library: true,
    },
  })

  const manifest = await getDocument({
    workspaceId: file.library.workspaceId,
    libraryId: file.libraryId,
    documentId: file.id,
  })
  if (manifest) {
    return manifest
  }

  const libExists = await existsLibrary(file.library.workspaceId, { libraryId: file.libraryId })
  if (!libExists) {
    await fixMissingLibraryManifest(file.libraryId)
  }

  logger.warn('Fixing missing documentmanifest', { documentId, file })
  const newManifest = await createDocument(file.library.workspaceId, {
    documentId,
    libraryId: file.libraryId,
    mimeType: file.mimeType,
    name: file.name,
    uri: file.originUri ?? `fix:missing:document:manifest:${documentId}`,
  })

  return newManifest
}
