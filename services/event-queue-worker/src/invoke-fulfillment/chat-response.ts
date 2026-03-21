import { getConfigValue } from '@george-ai/app-commons'
import { ChatAttachment } from '@george-ai/app-schema'
import { ChatRequest, ChatResponse } from '@george-ai/event-service-client'
import { getIdentifier, parseUri, readAttachment } from '@george-ai/file-management'
import { chatStream } from '@george-ai/llm-client'

import { getInferenceModelConnection, logger } from './common'

export async function getChatResponse(event: ChatRequest): Promise<ChatResponse> {
  logger.debug('Generating chat completion for event', { event })
  const { workspaceId, driver, modelName, messages, attachments } = event

  const connection = await getInferenceModelConnection({ workspaceId, driver, modelName })

  if (!connection) {
    throw new Error(`No connection found for ${event.driver} : ${event.modelName} in current workspace`)
  }

  const attachmentsWithStreams = await Promise.all(
    attachments.map(async (attachment) => {
      const stream = await getAttachmentStream(attachment)
      return {
        ...attachment,
        stream,
      }
    }),
  )

  // testing
  if (getConfigValue('LOG_LEVEL') === 'debug') {
    if (attachments.length > 0) {
      logger.info('Attachments with streams for chat completion', {
        attachments: attachments.map((a) => ({ fileName: a.fileName, uri: a.uri })),
      })
      const firstAttachment = await getAttachmentStream(attachments[0])
      for await (const chunk of firstAttachment) {
        logger.info('Received chunk from attachment stream for debugging', {
          chunkLength: chunk.length,
          sample: chunk.slice(0, 100), // Log the first 100 bytes for debugging
        })
        break // Only read the first chunk for debugging
      }
    }
  }

  const stream = await chatStream({
    connection,
    modelName,
    messages,
    attachments: attachmentsWithStreams,
    modelOptions: event.modelOptions,
  })

  logger.info('Received initial response from provider, starting to stream chat completion chunks', { event })
  let thinking = ''
  let content = ''
  let completionTokens = 0
  let promptTokens = 0
  let thinkingLineCount = 0
  let contentLineCount = 0

  for await (const chunk of stream) {
    if (chunk.thinking) {
      thinking += chunk.thinking
      thinkingLineCount++
      if (thinkingLineCount % 100 === 0) {
        logger.info('Thinking in progress', { thinkingLineCount, thinkingLength: thinking.length })
      }
    } else {
      content += chunk.chunk
      contentLineCount++
      if (contentLineCount % 100 === 0) {
        logger.info('Content generation in progress', { contentLineCount, contentLength: content.length })
      }
      completionTokens += chunk.completionTokens ?? 0
      promptTokens += chunk.promptTokens ?? 0
    }
  }

  logger.info('Finished receiving chat completion from provider', {
    thinkingLineCount,
    contentLineCount,
    thinkingLength: thinking.length,
    contentLength: content.length,
  })

  const response: ChatResponse = {
    version: 1,
    workspaceId,
    success: true,
    verb: 'response',
    action: 'chatCompletion',
    timestamp: new Date(),
    chunk: content,
    thinking,
    created: new Date(),
    completionTokens,
    promptTokens,
  }

  return response
}

async function getAttachmentStream(attachment: ChatAttachment) {
  const { workspaceId, libraryId, documentId, extractionMethod } = parseUri(attachment.uri)

  const identifier = getIdentifier({ workspaceId, libraryId, documentId, extractionMethod })

  const result = await readAttachment(identifier, attachment.fileName)
  return result.stream
}
