import { eventClient } from '../client'
import { logger } from './common'
import { WorkspaceRequest, WorkspaceResponse, WorkspaceStatus } from './schema'
import { getAsyncSubject } from './subject'

export async function publish(event: WorkspaceRequest | WorkspaceResponse | WorkspaceStatus): Promise<void> {
  const subject = getAsyncSubject(event)
  logger.debug(`publish request`, { event, subject })
  const publishResult = await eventClient.publish({
    subject,
    event,
  })
  logger.debug(`request published`, { event, subject, publishResult })
}
