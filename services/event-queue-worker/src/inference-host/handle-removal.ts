import { deleteState } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function handleInferenceHostRemoval(params: { workspaceId: string; hostId: string }) {
  logger.debug('update inference host config', { params })

  const { workspaceId, hostId } = params

  await deleteState({ type: 'inferenceHost', workspaceId, hostId })
  await deleteState({ type: 'inferenceModel', workspaceId, hostId }) // TODO: Check if the models also have a different host...
}
