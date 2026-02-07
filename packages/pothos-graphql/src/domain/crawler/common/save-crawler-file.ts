import { Readable } from 'node:stream'

import { prisma } from '@george-ai/app-database'
import { workspace } from '@george-ai/app-domain'

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
    ? await workspace.getSourceFileHash({ workspaceId, libraryId, fileId: existingFile.id })
    : null

  const saveResult = await workspace.saveSourceFile({
    workspaceId,
    libraryId,
    fileUri,
    fileName,
    mimeType,
    crawlerId,
    stream: content instanceof Readable ? content : Readable.from([content]),
    modificationDate,
  })

  const contentChanged = hashBefore !== saveResult.hash

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
    fileId: saveResult.fileId,
    fileName: saveResult.fileName,
    originUri: saveResult.originUri,
    mimeType: saveResult.mimeType,
    skipProcessing: !contentChanged,
    wasUpdated: existingFile ? contentChanged : false,
  }
}
