import { ActionType, workspaceProcessing } from '@george-ai/event-service-client'

import { getProcessingSettings } from './processing-settings'

export async function processFile(params: {
  workspaceId: string
  libraryId: string
  fileId: string
  fragment?: number | null
  actionType: ActionType
}): Promise<void> {
  const { libraryId, workspaceId, fileId, fragment, actionType } = params
  const settings = await getProcessingSettings({ libraryId, workspaceId })

  if (fragment !== undefined && (actionType === 'embedFile' || actionType === 'extractFile')) {
    throw new Error(`Fragment parameter is not applicable for ${actionType} action`)
  }
  switch (actionType) {
    case 'extractFile':
      await Promise.all(
        settings.extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishActionEvent({
            version: 1,
            workspaceId,
            libraryId,
            fileId: fileId,
            actionType: 'extractFile',
            extractionMethod,
          }),
        ),
      )
      break
    case 'embedFile':
      await Promise.all(
        settings.extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishActionEvent({
            version: 1,
            workspaceId,
            libraryId,
            fileId: fileId,
            actionType: 'embedFile',
            embeddingModelProvider: settings.embeddingModelProvider,
            embeddingModelName: settings.embeddingModelName,
            extractionMethod,
          }),
        ),
      )
      break
    case 'enrichItem':
      await workspaceProcessing.publishActionEvent({
        version: 1,
        workspaceId,
        libraryId,
        fileId,
        fragment,
        actionType: 'enrichItem',
      })
      break
    default:
      throw new Error(`Unsupported action type: ${params.actionType}`)
  }
}
