import { createLogger } from '@george-ai/web-utils'

import { PROCESS_TYPES, ProcessType } from './schema'

export const logger = createLogger('event-service-client:workspace-processing')

export const WORKSPACE_STREAM_NAME = 'workspace_processing'
export const WORKSPACE_PROCESSING_SUBJECT_PREFIX = 'processing.workspace'
export const WORKSPACE_PROCESSING_STREAM_SUBJECTS = [`${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.>`]

export const getConsumerName = (parameters: { workspaceId: string; processType: ProcessType }): string => {
  return `workspace-processing-consumer-${parameters.workspaceId}-${parameters.processType}`
}

export const getConsumerNames = (parameters: { workspaceId: string }): string[] => {
  const { workspaceId } = parameters
  return PROCESS_TYPES.map((processType) => getConsumerName({ workspaceId, processType }))
}

export const getProcessSubject = ({ workspaceId, processType }: { workspaceId: string; processType: ProcessType }) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.request.${processType}`
}

export const getStatusSubject = ({ workspaceId, processType }: { workspaceId: string; processType: ProcessType }) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${processType}`
}

export const getConsumerGlobPattern = ({
  processType,
  workspaceId,
}: {
  processType?: ProcessType
  workspaceId?: string
}): string => {
  return `workspace-processing-consumer-${workspaceId ? workspaceId : '*'}-${processType ? processType : '*'}`
}

export const getConsumerSubjectFilters = ({
  workspaceId,
  processType,
}: {
  workspaceId: string
  processType: ProcessType
}) => {
  return [
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.request.${processType}`,
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${processType}`,
  ]
}
