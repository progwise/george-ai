import { Readable } from 'node:stream'

import { prisma } from '@george-ai/app-database'
import { getSourceHash, saveDocument } from '../../document'

import { logger } from '.'

export const saveCrawlerFile = async (parameters: {
  workspaceId: string
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  mimeType: string
  content: Buffer | Readable
  modificationDate?: Date
}) => {
  const { workspaceId, fileName, fileUri, libraryId, crawlerId, mimeType, content, modificationDate } = parameters

  const existingFile = await prisma.aiLibraryFile.findUnique({
    where: { libraryId_originUri: { libraryId, originUri: fileUri } },
    select: { id: true, name: true, originUri: true, mimeType: true },
  })

  const hashBefore = existingFile
    ? await getSourceHash(workspaceId, { libraryId, documentId: existingFile.id })
    : null

  const saveResult = await saveDocument(workspaceId, {
    libraryId,
    uri: fileUri,
    name: fileName,
    mimeType,
    crawlerId,
    sourceStream: content instanceof Readable ? content : Readable.from([content]),
    modificationDate,
  })

  const contentChanged = hashBefore !== saveResult.sourceHash

  if (!contentChanged && existingFile) {
    // TODO: What if the fileName or mimeType changed? Edge cases to consider - for now we only check content hash to determine if we skip processing
    logger.debug('Content hash unchanged for HTTP crawler file, skipping save', { parameters, hashBefore, saveResult })
    return {
      fileId: existingFile.id,
      fileName: existingFile.name,
      originUri: existingFile.originUri,
      mimeType: existingFile.mimeType,
      skipProcessing: true,
      wasUpdated: false,
    }
  }

  return {
    fileId: saveResult.documentId,
    fileName: saveResult.name,
    originUri: saveResult.origin.uri,
    mimeType: saveResult.mimeType,
    skipProcessing: !contentChanged,
    wasUpdated: existingFile ? contentChanged : false,
  }
}
