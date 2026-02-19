import { ProcessingRequestType } from '@george-ai/app-commons'

import { processFile } from './process-file'

export async function processFiles(params: {
  workspaceId: string
  libraryId: string
  fileIds: string[]
  requestType: ProcessingRequestType
}): Promise<void> {
  const { libraryId, workspaceId, fileIds, requestType } = params

  await Promise.all(fileIds.map((fileId) => processFile({ workspaceId, libraryId, fileId, requestType })))
}
