import z from 'zod'

import { PROVIDERS } from '../provider/common'

export const AI_SERVICE_CALLS = ['embedTextChunk', 'embedFile', 'chatCompletion', 'imageGeneration'] as const
export type AiServiceCall = (typeof AI_SERVICE_CALLS)[number]

export const AiServiceCallBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  provider: z.enum(PROVIDERS),
  modelName: z.string(),
  timestamp: z.string(), // ISO date string
  callType: z.enum(AI_SERVICE_CALLS),
  timeoutMs: z.number().optional(),
})

export const EmbedFileCallSchema = AiServiceCallBaseSchema.extend({
  callType: z.literal('embedFile'),
  fileId: z.string(),
  fileFragmentId: z.string().optional(),
})
export type EmbedFileCall = z.infer<typeof EmbedFileCallSchema>

export const EmbedTextChunkCallSchema = AiServiceCallBaseSchema.extend({
  callType: z.literal('embedTextChunk'),
  textChunk: z.string(),
})
export type EmbedTextChunkCall = z.infer<typeof EmbedTextChunkCallSchema>

export const ChatCompletionCallSchema = AiServiceCallBaseSchema.extend({
  callType: z.literal('chatCompletion'),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    }),
  ),
})
export type ChatCompletionCall = z.infer<typeof ChatCompletionCallSchema>

export const AiCallSchema = z.discriminatedUnion('callType', [EmbedFileCallSchema, ChatCompletionCallSchema])
export type AiCall = z.infer<typeof AiCallSchema>

export const AiResponseBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  provider: z.enum(PROVIDERS),
  modelName: z.string(),
  timestamp: z.string(), // ISO date string
  callType: z.enum(AI_SERVICE_CALLS),
})

export const EmbedFileResponseSchema = AiResponseBaseSchema.extend({
  callType: z.literal('embedFile'),
  fileId: z.string(),
  fileFragmentId: z.string().optional(),
  embedding: z.array(z.number()),
})

export type EmbedFileResponse = z.infer<typeof EmbedFileResponseSchema>

export const EmbedTextChunkResponseSchema = AiResponseBaseSchema.extend({
  callType: z.literal('embedTextChunk'),
  textChunk: z.string(),
  embedding: z.array(z.number()),
})

export type EmbedTextChunkResponse = z.infer<typeof EmbedTextChunkResponseSchema>

export const ChatCompletionResponseSchema = AiResponseBaseSchema.extend({
  callType: z.literal('chatCompletion'),
  chunk: z.string(),
})

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>

export const AiResponseSchema = z.discriminatedUnion('callType', [
  EmbedFileResponseSchema,
  EmbedTextChunkResponseSchema,
  ChatCompletionResponseSchema,
])

export type AiResponse = z.infer<typeof AiResponseSchema>
