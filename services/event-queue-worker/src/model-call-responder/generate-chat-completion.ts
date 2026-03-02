import { ChatCompletionCall, ChatCompletionResponse, ProviderInstance } from '@george-ai/event-service-client'
import { getIdentifier } from '@george-ai/file-management'
import { readAttachment } from '@george-ai/file-management/src/workspace-storage/attachment'
import { chat } from '@george-ai/llm-client'

import { logger } from './common'

export async function generateChatCompletion(
  event: ChatCompletionCall,
  providerInstance: ProviderInstance,
): Promise<ChatCompletionResponse> {
  logger.debug('Generating chat completion for event', { event, providerInstance })
  const startTime = Date.now()

  const attachments = await Promise.all(
    !event.attachments
      ? []
      : event.attachments?.map(async (attachment) => {
          const identifier = getIdentifier(attachment)
          const { stream, size, mimeType } = await readAttachment(identifier, attachment.fileName)
          return {
            fileName: attachment.fileName,
            mimeType,
            size,
            stream,
          }
        }),
  )

  const result = await chat({
    connection: providerInstance.connection,
    options: {
      modelName: event.modelName,
      messages: event.messages,
      attachments,
    },
  })

  const response: ChatCompletionResponse = {
    version: 1,
    modelCallType: 'generateChatCompletion',
    chunks: [result.content],
    processingDurationMs: Date.now() - startTime,
    providerInstanceUrl: providerInstance.connection.baseUrl || 'unknown',
    resultStatus: 'success',
    errorMessage: null,
  }
  return response
}
