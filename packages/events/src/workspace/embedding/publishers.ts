import type { EventClient } from '@george-ai/event-service-client'

import { ensureWorkspaceStream } from '../workspace-setup'
import type { EmbeddingFinishedEvent, EmbeddingProgressEvent, EmbeddingRequestEvent } from './schemas'

export const publishEmbeddingRequest = async (client: EventClient, request: EmbeddingRequestEvent) => {
  await ensureWorkspaceStream(client, request.workspaceId)
  const subject = `workspace.${request.workspaceId}.file-embedding-request`
  const payload = new TextEncoder().encode(JSON.stringify(request))
  await client.publish({
    subject,
    payload,
    timeoutMs: request.timeoutMs,
  })
}

export const publishEmbeddingProgress = async (client: EventClient, progress: EmbeddingProgressEvent) => {
  await ensureWorkspaceStream(client, progress.workspaceId)
  const subject = `workspace.${progress.workspaceId}.file-embedding-progress`
  const payload = new TextEncoder().encode(JSON.stringify(progress))
  await client.publish({
    subject,
    payload,
    timeoutMs: progress.timeoutMs,
  })
}

export const publishEmbeddingFinished = async (client: EventClient, finished: EmbeddingFinishedEvent) => {
  await ensureWorkspaceStream(client, finished.workspaceId)
  const subject = `workspace.${finished.workspaceId}.file-embedding-finished`
  const payload = new TextEncoder().encode(JSON.stringify(finished))
  await client.publish({
    subject,
    payload,
    timeoutMs: finished.timeoutMs,
  })
}
