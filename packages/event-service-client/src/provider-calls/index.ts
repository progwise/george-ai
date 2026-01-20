import { eventClient } from '../client'
import { AI_SERVICE_CALLS_STREAM_NAME, AI_SERVICE_CALLS_STREAM_SUBJECTS } from './common'
import { ensureProviderInstanceConsumer } from './consumers'
import { publishProviderCallEvent } from './publish'
import { directProviderCall, respondDirectProviderCalls } from './request'
import { AI_SERVICE_CALLS } from './schema'
import { subscribeAiCalls } from './subscribe'

export const initializeProviderCallsStream = async () => {
  await eventClient.ensureStream({
    streamName: AI_SERVICE_CALLS_STREAM_NAME,
    description: `Events for AI service provider calls`,
    subjects: AI_SERVICE_CALLS_STREAM_SUBJECTS,
    persist: true,
  })
  return AI_SERVICE_CALLS_STREAM_NAME
}

export type {
  AiCall,
  AiResponse,
  AiServiceCall,
  EmbedFileCall,
  EmbedTextChunkCall,
  EmbedFileResponse,
  EmbedTextChunkResponse,
  ChatCompletionCall,
  ChatCompletionResponse,
} from './schema'

export default {
  AI_SERVICE_CALLS,
  directProviderCall,
  respondDirectProviderCalls,
  publishProviderCallEvent,
  ensureProviderInstanceConsumer,
  subscribeAiCalls,
}
