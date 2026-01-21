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

export const getProcessingStatus = async (workspaceId: string) => {
  const result = await Promise.all(
    workspaceProcessing.PROCESS_TYPES.map(async (processType) => {
      const status = await workspaceProcessing.processingStatus({ workspaceId, processType })
      return { processType, status }
    }),
  )
  return result
}
