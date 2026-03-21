import z from 'zod'

import {
  ChatAttachmentSchema,
  ChatMessageSchema,
  ChatResponseChunkSchema,
  InferenceDriverSchema,
} from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from '../base-schema'

export const ChatRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('chatCompletion'),
  driver: InferenceDriverSchema,
  modelName: z.string(),
  messages: z.array(ChatMessageSchema),
  attachments: z.array(ChatAttachmentSchema),
  modelOptions: z.record(z.unknown()).optional(),
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>

export const ChatResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('chatCompletion').default('chatCompletion'),
  success: z.literal(true),
}).extend({
  ...ChatResponseChunkSchema.shape,
})

export type ChatResponse = z.infer<typeof ChatResponseSchema>
