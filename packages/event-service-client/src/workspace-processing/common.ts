import { PROCESSING_REQUEST_TYPES, ProcessingRequestType, createLogger } from '@george-ai/app-commons'

export const logger = createLogger('event-service-client:workspace-processing')

export const WORKSPACE_STREAM_NAME = 'workspace_processing'
export const WORKSPACE_PROCESSING_SUBJECT_PREFIX = 'processing.workspace'
export const WORKSPACE_PROCESSING_STREAM_SUBJECTS = [`${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.>`]

const EVENT_TYPES = ['request', 'status', 'reply'] as const
export type EventType = (typeof EVENT_TYPES)[number]

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

export const getEventSubject = ({
  eventType,
  workspaceId,
  requestType,
  libraryId,
  documentId,
}: {
  eventType: EventType
  workspaceId: string
  requestType: ProcessingRequestType
  libraryId: string
  documentId: string
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId}.${eventType}.${requestType}.library.${libraryId}.document.${documentId}`
}

export const getEventSubjectFilter = ({
  eventType,
  workspaceId,
  requestType,
  libraryId,
  documentId,
}: {
  eventType?: EventType
  workspaceId?: string | null
  requestType?: ProcessingRequestType | null
  libraryId?: string | null
  documentId?: string | null
}) => {
  return `${WORKSPACE_PROCESSING_SUBJECT_PREFIX}.${workspaceId || '*'}.${eventType || '*'}.${requestType || '*'}.library.${libraryId || '*'}.document.${documentId || '*'}`
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
  return EVENT_TYPES.map((eventType) => getEventSubjectFilter({ eventType, workspaceId, requestType }))
}
