import { createLogger } from '@george-ai/app-commons'

export const ACTION_TYPES = ['chunkFile', 'extractFile', 'embedFile', 'enrichItem'] as const
export type ActionType = (typeof ACTION_TYPES)[number]

export const ACTION_STATUS_VALUES = ['pending', 'in-progress', 'completed', 'failed'] as const
export type ActionStatus = (typeof ACTION_STATUS_VALUES)[number]

export const logger = createLogger('event-service-client:workspace-processing')

export const WORKSPACE_STREAM_NAME = 'workspace_processing'
export const WORKSPACE_PROCESSING_SUBJECT_PREFIX = 'processing.workspace'
export const WORKSPACE_PROCESSING_STREAM_SUBJECTS = [`${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.>`]

export type EventType = 'action' | 'status' | 'reply'

export const getConsumerName = (parameters: { workspaceId: string; actionType: ActionType }): string => {
  return `workspace-processing-consumer-${parameters.workspaceId}-${parameters.actionType}`
}

export const getConsumerNames = (parameters: { workspaceId: string }): string[] => {
  const { workspaceId } = parameters
  return ACTION_TYPES.map((actionType) => getConsumerName({ workspaceId, actionType }))
}

export const getConsumerGlobPattern = ({
  actionType,
  workspaceId,
}: {
  actionType?: ActionType
  workspaceId?: string
}): string => {
  return `workspace-processing-consumer-${workspaceId ? workspaceId : '*'}-${actionType ? actionType : '*'}`
}

export const getActionSubject = ({ workspaceId, actionType }: { workspaceId: string; actionType: ActionType }) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.action.${actionType}`
}

export const getStatusSubject = ({ workspaceId, actionType }: { workspaceId: string; actionType: ActionType }) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${actionType}`
}

export const getReplySubject = ({ workspaceId, actionType }: { workspaceId: string; actionType: ActionType }) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.reply.${actionType}`
}

export const getEventType = (subject: string): EventType => {
  if (subject.includes('.action.')) {
    return 'action'
  } else if (subject.includes('.status.')) {
    return 'status'
  } else if (subject.includes('.reply.')) {
    return 'reply'
  }
  throw new Error(`Cannot determine event type from subject: ${subject}`)
}

export const getConsumerSubjectFilters = ({
  workspaceId,
  actionType,
}: {
  workspaceId: string
  actionType: ActionType
}) => {
  return [
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.action.${actionType}`,
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${actionType}`,
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.reply.${actionType}`,
  ]
}
