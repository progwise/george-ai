import { eventClient } from '../client'
import { MODEL_CALLS_STREAM_NAME, MODEL_CALLS_STREAM_SUBJECTS, MODEL_CALL_TYPES, type ModelCallType } from './common'
import { ensureModelCallConsumer } from './consumers'
import { publishProviderCallEvent } from './publish'
import { directModelCall, respondDirectModelCall } from './request'
import { ChatCompletionCall, ChatCompletionResponse, EmbeddingCall, EmbeddingResponse, ModelCall } from './schema'
import { ModelResponse } from './schema'
import { subscribeModelCalls } from './subscribe'

export const ensureModelCallsStream = async () => {
  await eventClient.ensureWorkerStream({
    streamName: MODEL_CALLS_STREAM_NAME,
    description: `Events for AI service provider calls`,
    subjects: MODEL_CALLS_STREAM_SUBJECTS,
  })
  return MODEL_CALLS_STREAM_NAME
}

export type {
  ModelCallType,
  ModelResponse,
  ModelCall,
  EmbeddingCall,
  EmbeddingResponse,
  ChatCompletionCall,
  ChatCompletionResponse,
}

export default {
  MODEL_CALL_TYPES,
  directModelCall,
  respondDirectModelCall,
  publishProviderCallEvent,
  ensureModelCallConsumer,
  subscribeModelCalls,
}
