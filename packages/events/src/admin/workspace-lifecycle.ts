import type { EventClient } from '@george-ai/event-service-client'

import { AdminEventSchema, type WorkspaceCreatedEvent, type WorkspaceDeletedEvent } from './event-types'

const ADMIN_STREAM_NAME = 'admin'
const ADMIN_STREAM_SUBJECT = 'admin.*'

let adminStreamInitialized = false

const ensureAdminStream = async (client: EventClient) => {
  if (adminStreamInitialized) return

  await client.ensureStream({
    streamName: ADMIN_STREAM_NAME,
    description: 'System-wide admin events',
    subjects: [ADMIN_STREAM_SUBJECT],
    persist: true,
  })

  adminStreamInitialized = true
}

export const publishWorkspaceCreated = async (client: EventClient, event: WorkspaceCreatedEvent) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-created'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceDeleted = async (client: EventClient, event: WorkspaceDeletedEvent) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-deleted'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const subscribeWorkspaceLifecycle = async (
  client: EventClient,
  {
    subscriptionName,
    handler,
  }: {
    subscriptionName: string
    handler: (event: WorkspaceCreatedEvent | WorkspaceDeletedEvent) => Promise<void>
  },
) => {
  await ensureAdminStream(client)

  const cleanup = await client.subscribe({
    subscriptionName,
    streamName: ADMIN_STREAM_NAME,
    subjectFilter: 'admin.*',
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = AdminEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling admin event:', error)
        throw error
      }
    },
  })

  return cleanup
}

export const deleteWorkspaceStream = async (client: EventClient, workspaceId: string) => {
  const streamName = `workspace-${workspaceId}`
  await client.deleteStream(streamName)
}
