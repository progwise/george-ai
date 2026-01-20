import { type ProcessType, workspaceProcessing } from '@george-ai/event-service-client'

export const startProcessing = async (workspaceId: string, processType: ProcessType) => {
  await workspaceProcessing.startProcessing({
    workspaceId,
    processType,
  })
}

export const stopProcessing = async (workspaceId: string, processType: ProcessType) => {
  await workspaceProcessing.stopProcessing({
    workspaceId,
    processType,
  })
}
