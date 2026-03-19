import { getErrorMessage } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { logger } from '../common'
import { ErrorResponse, SyncAction, SyncRequest, SyncRequestSchema, SyncResponse } from './schema'
import { getSyncSubjectFilter, parseSyncSubject } from './subject'

export async function fulfillInvokes(args: {
  workspaceId?: string
  action?: SyncAction
  handler: (handlerParams: { workspaceId: string; action: SyncAction; request: SyncRequest }) => Promise<SyncResponse>
}) {
  const { workspaceId, action, handler } = args

  const cleanup = await eventClient.respond({
    subject: getSyncSubjectFilter({
      workspaceId,
      action,
    }),
    handler: async (subject, payload) => {
      const parsedSubject = parseSyncSubject(subject)
      if (!parsedSubject) {
        logger.error('Cannot fulfill invoke because of unknown subject - skipping', { subject, parsedSubject })
        throw new Error(`Fulfill handler cannot parse subject ${subject}`)
      }
      try {
        const { action, workspaceId } = parsedSubject
        const decoded = new TextDecoder().decode(payload)
        const json = JSON.parse(decoded)

        const request = SyncRequestSchema.parse(json)

        const result = await handler({ workspaceId, action, request })

        return new TextEncoder().encode(JSON.stringify(result))
      } catch (error) {
        logger.error('Error fulfillModelCall event', { error, subject })
        const errorResponse: ErrorResponse = {
          action: parsedSubject?.action,
          success: false,
          error: getErrorMessage(error),
          version: 1,
          workspaceId: parsedSubject.workspaceId,
          verb: 'response',
          timestamp: new Date(),
        }
        return new TextEncoder().encode(JSON.stringify(errorResponse))
      }
    },
  })

  return async () => {
    await cleanup()
  }
}
