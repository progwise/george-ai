import { getErrorMessage } from '@george-ai/app-commons'
import { EventQueue, EventQueueAction, EventQueueStatusSchema } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { ACTION_STREAM_NAME } from './common'
import { ASYNC_ACTIONS, AsyncAction } from './schema'
import { getConsumerSubjectFilters } from './subject'

export async function ensureWorkspaceConsumers(workspaceId: string) {
  await Promise.all(
    ASYNC_ACTIONS.map((action) =>
      ensureWorkspaceConsumer({
        workspaceId,
        action,
      }),
    ),
  )
}

const ensuredConsumersMap = new Map<string, Promise<void>>()

export async function ensureWorkspaceConsumer(args: { workspaceId: string; action: AsyncAction }) {
  const { workspaceId, action } = args
  const consumerName = getConsumerName({ workspaceId, action })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, action })
  const mapEntry = ensuredConsumersMap.get(consumerName)

  if (mapEntry) {
    return mapEntry
  }

  const newPromise = eventClient.ensureConsumer({
    streamName: ACTION_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 0,
    maxPendingMessages: 0,
    maxDeliveryAttempts: 5,
  })

  ensuredConsumersMap.set(consumerName, newPromise)
  return await newPromise
}

export const getConsumerName = (args: { workspaceId: string; action: AsyncAction }): string => {
  return `consumer-workspace-${args.workspaceId}-action-${args.action}`
}

export const getConsumerNames = (args: { workspaceId: string }): string[] => {
  const { workspaceId } = args
  return ASYNC_ACTIONS.map((action) => getConsumerName({ workspaceId, action }))
}

export const getConsumerGlobPattern = (args: { workspaceId?: string; action?: AsyncAction }): string => {
  const { workspaceId, action } = args
  return `consumer-workspace-${workspaceId ? workspaceId : '*'}-action-${action ? action : '*'}`
}

export async function pauseEventProcessing(args: {
  workspaceId: string
  action?: EventQueueAction
}): Promise<EventQueue[]> {
  const { workspaceId, action } = args

  const actions = action ? [action] : ASYNC_ACTIONS

  return await Promise.all(
    actions.map((action) =>
      eventClient
        .pauseConsumer({ streamName: ACTION_STREAM_NAME, consumerName: getConsumerName({ workspaceId, action }) })
        .then((report) => ({ ...report, action, status: 'paused' as const }))
        .catch((error) => ({ action, status: 'unknown' as const, error: getErrorMessage(error) })),
    ),
  )
}

export async function resumeEventProcessing(args: {
  workspaceId: string
  action?: EventQueueAction
}): Promise<EventQueue[]> {
  const { workspaceId, action } = args

  const actions = action ? [action] : ASYNC_ACTIONS

  return await Promise.all(
    actions.map((action) =>
      eventClient
        .resumeConsumer({ streamName: ACTION_STREAM_NAME, consumerName: getConsumerName({ workspaceId, action }) })
        .then((report) => ({ ...report, action, status: 'running' as const }))
        .catch((error) => ({ action, status: 'unknown' as const, error: getErrorMessage(error) })),
    ),
  )
}

export async function eventProcessingStatus(args: {
  workspaceId: string
  action?: EventQueueAction
}): Promise<EventQueue[]> {
  const { workspaceId, action } = args

  const actions = action ? [action] : ASYNC_ACTIONS

  const result = await Promise.all(
    actions.map((action) =>
      eventClient
        .consumerStatus({
          streamName: ACTION_STREAM_NAME,
          consumerName: getConsumerName({ workspaceId, action }),
        })
        .then((report) => ({ ...report, action, status: EventQueueStatusSchema.parse(report.status) }))
        .catch((error) => ({ action, status: 'unknown' as const, error: getErrorMessage(error) })),
    ),
  )
  return result
}
