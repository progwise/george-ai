import { createReadStream } from 'fs'
import path from 'node:path'
import { Readable } from 'stream'

import { ExtractionMethod } from '@george-ai/app-commons/src/types/extraction'

import { getAttachmentsDir } from './directories'

export async function readAttachment(
  workspaceId: string,
  args: { libraryId: string; fileId: string; extractionMethod: ExtractionMethod; filename: string },
): Promise<Readable> {
  const { libraryId, fileId, extractionMethod, filename } = args
  const attachmentsDir = await getAttachmentsDir(workspaceId, libraryId, fileId, extractionMethod)
  const attachmentPath = path.join(attachmentsDir, filename)

  return createReadStream(attachmentPath)
}
