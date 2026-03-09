import z from 'zod'

export const INFERENCE_DRIVERS = ['ollama', 'openai'] as const
export type InferenceDriver = (typeof INFERENCE_DRIVERS)[number]
export const InferenceDriverSchema = z.enum(INFERENCE_DRIVERS)

export const INFERENCE_ACTIONS = ['chunkEmbedding', 'chatCompletion'] as const
export type InferenceAction = (typeof INFERENCE_ACTIONS)[number]
export const InferenceActionSchema = z.enum(INFERENCE_ACTIONS)

export const CHAT_ROLES = ['user', 'assistant', 'system'] as const
export type ChatRole = (typeof CHAT_ROLES)[number]
export const ChatRoleSchema = z.enum(CHAT_ROLES)

export const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z.string(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatAttachmentSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  uri: z.string(),
})

export type ChatAttachment = z.infer<typeof ChatAttachmentSchema>

export const ChatResponseChunkSchema = z.object({
  chunk: z.string(),
  created: z.coerce.date(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
})

export type ChatResponseChunk = z.infer<typeof ChatResponseChunkSchema>

export const EmbeddingResultSchema = z.object({
  embeddings: z.array(
    z.object({
      chunk: z.string(),
      vector: z.array(z.number()),
    }),
  ),
  chunkTokens: z.number().optional(),
  totalTokens: z.number().optional(),
})

export type EmbeddingResult = z.infer<typeof EmbeddingResultSchema>
