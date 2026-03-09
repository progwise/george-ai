import { ChatAttachment } from '@george-ai/app-schema'
import { ChatRequest, ChatResponse } from '@george-ai/event-service-client'
import { getIdentifier, parseUri, readAttachment } from '@george-ai/file-management'
import { chat } from '@george-ai/llm-client'

import { getInferenceModelConnection, logger } from './common'

export async function getChatResponse(event: ChatRequest): Promise<ChatResponse> {
  logger.debug('Generating chat completion for event', { event })
  const { workspaceId, driver, modelName, messages, attachments } = event

  const connection = await getInferenceModelConnection({ workspaceId, driver, modelName })

  if (!connection) {
    throw new Error(`No connection found for ${event.driver} : ${event.modelName} in current workspace`)
  }

  const result = await chat({
    connection,
    modelName,
    messages,
    attachments: await Promise.all(
      attachments.map(async (attachment) => {
        const stream = await getAttachmentStream(attachment)
        return {
          ...attachment,
          stream,
        }
      }),
    ),
  })

  const response: ChatResponse = {
    version: 1,
    workspaceId,
    verb: 'response',
    action: 'chatCompletion',
    timestamp: new Date(),
    chunk: result.chunk,
    created: result.created,
    completionTokens: result.completionTokens,
    promptTokens: result.promptTokens,
  }

  return response
}

async function getAttachmentStream(attachment: ChatAttachment) {
  const { workspaceId, libraryId, documentId, extractionMethod } = parseUri(attachment.uri)

  const identifier = getIdentifier({ workspaceId, libraryId, documentId, extractionMethod })

  const result = await readAttachment(identifier, attachment.fileName)
  return result.stream
}
