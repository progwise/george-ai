import z from 'zod'

import { MODEL_PROVIDERS } from '@george-ai/app-commons'

import { ContextSchema } from '../common'
import { MODEL_CALL_TYPES } from './common'

export const ModelBaseCall = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  provider: z.enum(MODEL_PROVIDERS),
  modelName: z.string(),
  modelCallType: z.enum(MODEL_CALL_TYPES),
  timeoutMs: z.number().optional(),
  replySubject: z.string().optional(),
  context: ContextSchema.optional(),
})

export const EmbeddingCallSchema = ModelBaseCall.extend({
  modelCallType: z.literal('generateEmbedding'),
  inputTexts: z.array(z.string()),
})
export type EmbeddingCall = z.infer<typeof EmbeddingCallSchema>

export const ChatCompletionCallSchema = ModelBaseCall.extend({
  modelCallType: z.literal('generateChatCompletion'),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    }),
  ),
  attachmentFilePaths: z.array(z.string()).optional(),
})
export type ChatCompletionCall = z.infer<typeof ChatCompletionCallSchema>

export const ModelCallSchema = z.discriminatedUnion('modelCallType', [EmbeddingCallSchema, ChatCompletionCallSchema])
export type ModelCall = z.infer<typeof ModelCallSchema>

export const ModelResponseBaseSchema = z.object({
  version: z.literal(1),
  resultStatus: z.enum(['success', 'error']),
  errorMessage: z.string().nullable().optional(),
  providerInstanceUrl: z.string().nullable(),
  processingDurationMs: z.number(),
  modelCallType: z.enum(MODEL_CALL_TYPES),
})

export const EmbeddingResponseSchema = ModelResponseBaseSchema.extend({
  modelCallType: z.literal('generateEmbedding'),
  embeddings: z.array(z.array(z.number())),
})

export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>

export const ChatCompletionResponseSchema = ModelResponseBaseSchema.extend({
  modelCallType: z.literal('generateChatCompletion'),
  chunks: z.array(z.string()),
})

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>

export const ModelResponseSchema = z.discriminatedUnion('modelCallType', [
  EmbeddingResponseSchema,
  ChatCompletionResponseSchema,
])

export type ModelResponse = z.infer<typeof ModelResponseSchema>
