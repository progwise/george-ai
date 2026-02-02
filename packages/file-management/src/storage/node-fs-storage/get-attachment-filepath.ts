import { constants, promises } from 'fs'
import path from 'path'

import { ExtractionMethod } from '@george-ai/app-commons/src/types/extraction'

import { getExtractionDir } from './directories'

export async function getAttachmentFilePath(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    extractionMethod: ExtractionMethod
    attachmentFileName: string
  },
): Promise<string | null> {
  const { libraryId, fileId, extractionMethod, attachmentFileName } = args
  const attachmentDir = await getExtractionDir(workspaceId, libraryId, fileId, extractionMethod)
  const attachmentPath = path.join(attachmentDir, 'attachments', attachmentFileName)

  return await promises
    .access(attachmentPath, constants.R_OK)
    .then(() => attachmentPath)
    .catch(() => null)
}
