import { PROCESSING_REQUEST_TYPES, ProcessingRequestType, createLogger } from '@george-ai/app-commons'

export const logger = createLogger('event-service-client:workspace-processing')

export const WORKSPACE_STREAM_NAME = 'workspace_processing'
export const WORKSPACE_PROCESSING_SUBJECT_PREFIX = 'processing.workspace'
export const WORKSPACE_PROCESSING_STREAM_SUBJECTS = [`${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.>`]

export type EventType = 'request' | 'status' | 'reply'

export const getConsumerName = (parameters: { workspaceId: string; requestType: ProcessingRequestType }): string => {
  return `workspace-processing-consumer-${parameters.workspaceId}-${parameters.requestType}`
}

export const getConsumerNames = (parameters: { workspaceId: string }): string[] => {
  const { workspaceId } = parameters
  return PROCESSING_REQUEST_TYPES.map((requestType) => getConsumerName({ workspaceId, requestType }))
}

export const getConsumerGlobPattern = ({
  requestType,
  workspaceId,
}: {
  requestType?: ProcessingRequestType
  workspaceId?: string
}): string => {
  return `workspace-processing-consumer-${workspaceId ? workspaceId : '*'}-${requestType ? requestType : '*'}`
}

export const getRequestSubject = ({
  workspaceId,
  requestType,
  libraryId,
  fileId,
}: {
  workspaceId: string
  requestType: ProcessingRequestType
  libraryId: string
  fileId: string
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.request.${requestType}.library.${libraryId}.file.${fileId}`
}

export const getRequestSubjectFilter = ({
  workspaceId,
  requestType,
  libraryId,
  fileId,
}: {
  workspaceId?: string | null
  requestType?: ProcessingRequestType | null
  libraryId?: string | null
  fileId?: string | null
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId || '*'}.request.${requestType || '*'}.library.${libraryId || '*'}.file.${fileId || '*'}`
}

export const getStatusSubject = ({
  workspaceId,
  requestType,
  libraryId,
  fileId,
}: {
  workspaceId: string
  requestType: ProcessingRequestType
  libraryId: string
  fileId: string
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${requestType}.library.${libraryId}.file.${fileId}`
}

export const getReplySubject = ({
  workspaceId,
  requestType,
  libraryId,
  fileId,
}: {
  workspaceId: string
  requestType: ProcessingRequestType
  libraryId: string
  fileId: string
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.reply.${requestType}.library.${libraryId}.file.${fileId}`
}

export const getEventType = (subject: string): EventType => {
  if (subject.includes('.request.')) {
    return 'request'
  } else if (subject.includes('.status.')) {
    return 'status'
  } else if (subject.includes('.reply.')) {
    return 'reply'
  }
  throw new Error(`Cannot determine event type from subject: ${subject}`)
}

export const getConsumerSubjectFilters = ({
  workspaceId,
  requestType,
}: {
  workspaceId: string
  requestType: ProcessingRequestType
}) => {
  return [
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.request.${requestType}.>`,
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.status.${requestType}.>`,
    `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.reply.${requestType}.>`,
  ]
}
