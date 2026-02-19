import { createLogger } from '@george-ai/app-commons'

import { UsageTrackingEvent } from './schema'

export const logger = createLogger('event-service-client:workspace-usage')

export const USAGE_STREAM_NAME = 'usage_tracking'
export const USAGE_STREAM_SUBJECTS = ['usage.workspace.*.>']

export const getEventSubject = (event: UsageTrackingEvent) => {
  const subject = `usage.workspace.${event.workspaceId}`
  if (event.libraryId && event.fileId) {
    return `${subject}.library.${event.libraryId}.file.${event.fileId}`
  } else if (event.libraryId) {
    return `${subject}.library.${event.libraryId}`
  } else if (event.listId && event.fieldId) {
    return `${subject}.list.${event.listId}.field.${event.fieldId}`
  } else if (event.listId) {
    return `${subject}.list.${event.listId}`
  } else {
    return subject
  }
}

export const getConsumerName = (args: { workspaceId: string }): string => {
  const { workspaceId } = args
  return `workspace-usage-consumer-${workspaceId}`
}

export const getConsumerSubjectFilters = (args: { workspaceId: string }) => {
  return [`usage.workspace.${args.workspaceId}.>`]
}

export const getConsumerGlobPattern = (): string => {
  return `workspace-usage-consumer-*`
}
