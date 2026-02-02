import { ActionType } from '@george-ai/event-service-client'

import { processFile } from './process-file'

export async function processFiles(params: {
  workspaceId: string
  libraryId: string
  fileIds: string[]
  actionType: ActionType
}): Promise<void> {
  const { libraryId, workspaceId, fileIds, actionType } = params

  await Promise.all(fileIds.map((fileId) => processFile({ workspaceId, libraryId, fileId, actionType })))
}
