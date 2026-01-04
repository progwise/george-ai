import { eventClient } from '../../shared'
import { ensureWorkspaceStream } from '../workspace-setup'
import type { EmbeddingFinishedEvent, EmbeddingProgressEvent, EmbeddingRequestEvent } from './schemas'

export const publishEmbeddingRequest = async (request: EmbeddingRequestEvent) => {
  await ensureWorkspaceStream(request.workspaceId)
  const subject = `workspace.${request.workspaceId}.file-embedding-request`
  const payload = new TextEncoder().encode(JSON.stringify(request))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: request.timeoutMs,
  })
}

export const publishEmbeddingProgress = async (progress: EmbeddingProgressEvent) => {
  await ensureWorkspaceStream(progress.workspaceId)
  const subject = `workspace.${progress.workspaceId}.file-embedding-progress`
  const payload = new TextEncoder().encode(JSON.stringify(progress))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: progress.timeoutMs,
  })
}

export const publishEmbeddingFinished = async (finished: EmbeddingFinishedEvent) => {
  await ensureWorkspaceStream(finished.workspaceId)
  const subject = `workspace.${finished.workspaceId}.file-embedding-finished`
  const payload = new TextEncoder().encode(JSON.stringify(finished))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: finished.timeoutMs,
  })
}
