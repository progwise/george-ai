import z from 'zod'

import { ContextSchema, ResultSchema } from '../common'
import { MODEL_PROVIDERS } from '../model-provider/common'
import { ACTION_STATUS_VALUES, ACTION_TYPES, EXTRACTION_METHODS } from './common'

// Base

export const ActionBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  actionType: z.enum(ACTION_TYPES),
  settings: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
})

export const StatusBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  actionType: z.enum(ACTION_TYPES),
  timestamp: z.string(),
})

// Extract File

export const ExtractFileActionSchema = ActionBaseSchema.extend({
  actionType: z.literal('extractFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ExtractFileAction = z.infer<typeof ExtractFileActionSchema>

export const ExtractFileStatusSchema = StatusBaseSchema.extend({
  actionType: z.literal('extractFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  status: z.enum(ACTION_STATUS_VALUES),
  details: z.string().optional(),
})

export type ExtractFileStatus = z.infer<typeof ExtractFileStatusSchema>

// Chunk File

export const ChunkFileActionSchema = ActionBaseSchema.extend({
  actionType: z.literal('chunkFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ChunkFileAction = z.infer<typeof ChunkFileActionSchema>

export const ChunkFileStatusSchema = StatusBaseSchema.extend({
  actionType: z.literal('chunkFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
  details: z.string().optional(),
})

export type ChunkFileStatus = z.infer<typeof ChunkFileStatusSchema>

// Embed file

export const EmbedFileActionSchema = ActionBaseSchema.extend({
  actionType: z.literal('embedFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  embeddingModelProvider: z.enum(MODEL_PROVIDERS),
  embeddingModelName: z.string(),
})

export type EmbedFileAction = z.infer<typeof EmbedFileActionSchema>

export const EmbedFileStatusSchema = StatusBaseSchema.extend({
  actionType: z.literal('embedFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  status: z.enum(ACTION_STATUS_VALUES),
  details: z.string().optional(),
})

export type EmbedFileStatus = z.infer<typeof EmbedFileStatusSchema>

// Enrichment

export const EnrichItemActionSchema = ActionBaseSchema.extend({
  actionType: z.literal('enrichItem'),
  libraryId: z.string(),
  fileId: z.string(),
  fragment: z.number().optional(),
})

export type EnrichItemAction = z.infer<typeof EnrichItemActionSchema>

export const EnrichItemStatusSchema = StatusBaseSchema.extend({
  actionType: z.literal('enrichItem'),
  libraryId: z.string(),
  fileId: z.string(),
  fileFragmentIndex: z.number().optional(),
  status: z.enum(ACTION_STATUS_VALUES),
  details: z.string().optional(),
})

export type EnrichItemStatus = z.infer<typeof EnrichItemStatusSchema>

export const ReplyEventSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  actionType: z.enum(ACTION_TYPES),
  timestamp: z.string(),
  result: ResultSchema,
  context: ContextSchema,
})

export type ReplyEvent = z.infer<typeof ReplyEventSchema>

// Action Events
export type ActionEvent = ExtractFileAction | ChunkFileAction | EmbedFileAction | EnrichItemAction

export const ActionEventSchema = z.discriminatedUnion('actionType', [
  ExtractFileActionSchema,
  ChunkFileActionSchema,
  EmbedFileActionSchema,
  EnrichItemActionSchema,
])

export type StatusEvent = ExtractFileStatus | ChunkFileStatus | EmbedFileStatus | EnrichItemStatus

export const StatusEventSchema = z.discriminatedUnion('actionType', [
  ExtractFileStatusSchema,
  ChunkFileStatusSchema,
  EmbedFileStatusSchema,
  EnrichItemStatusSchema,
])

export const EventSchemas = {
  action: ActionEventSchema,
  reply: ReplyEventSchema,
  status: StatusEventSchema,
}
