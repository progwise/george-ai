import z from 'zod'

import { EXTRACTION_METHODS, MODEL_PROVIDERS } from '@george-ai/app-commons'
import { PROCESSING_REQUEST_TYPES, PROCESSING_STATUS_VALUES } from '@george-ai/app-commons'

import { ContextSchema, ResultSchema } from '../common'

/**
 * Request Schemas and Types
 */

// Base

export const ProcessingRequestSettingsSchema = z.record(z.string().or(z.number()).or(z.boolean())).nullable().optional()

export type ProcessingRequestSettings = z.infer<typeof ProcessingRequestSettingsSchema>

// TODO: Add libraryId and fileId to the base schema if they are common to all request types, or keep them in the specific schemas if they are not always present.
export const ProcessingRequestBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  requestType: z.enum(PROCESSING_REQUEST_TYPES),
  settings: ProcessingRequestSettingsSchema,
})

// Extract File

export const ExtractFileRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('extractFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ExtractFileRequest = z.infer<typeof ExtractFileRequestSchema>

// Embed file

export const EmbedFileRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('embedFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  embeddingModelProvider: z.enum(MODEL_PROVIDERS),
  embeddingModelName: z.string(),
})

export type EmbedFileRequest = z.infer<typeof EmbedFileRequestSchema>

// Enrich Item

export const EnrichItemRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('enrichItem'),
  libraryId: z.string(),
  fileId: z.string(),
  fragment: z.number().nullable().optional(),
})

export type EnrichItemRequest = z.infer<typeof EnrichItemRequestSchema>

// Discriminated Union of all Requests

export const ProcessingRequestSchema = z.discriminatedUnion('requestType', [
  ExtractFileRequestSchema,
  EmbedFileRequestSchema,
  EnrichItemRequestSchema,
])

export type ProcessingRequest = z.infer<typeof ProcessingRequestSchema>

/*
Status Schemas and Types
*/

// Base Status

export const ProcessingStatusBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  requestType: z.enum(PROCESSING_REQUEST_TYPES),
  timestamp: z.string(),
  status: z.enum(PROCESSING_STATUS_VALUES),
  details: z.string().nullable().optional(),
})

// Extract File Status
export const ExtractFileStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('extractFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ExtractFileStatus = z.infer<typeof ExtractFileStatusSchema>

// Embed File Status

export const EmbedFileStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('embedFile'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type EmbedFileStatus = z.infer<typeof EmbedFileStatusSchema>

// Enrich Item Status

export const EnrichItemStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('enrichItem'),
  libraryId: z.string(),
  fileId: z.string(),
  fragment: z.number().nullable().optional(),
})

export type EnrichItemStatus = z.infer<typeof EnrichItemStatusSchema>

// Discriminated Union of all Statuses

export const ProcessingStatusSchema = z.discriminatedUnion('requestType', [
  ExtractFileStatusSchema,
  EmbedFileStatusSchema,
  EnrichItemStatusSchema,
])

export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>

/**
 * Reply Schemas and Types
 */

export const ProcessingReplySchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  requestType: z.enum(PROCESSING_REQUEST_TYPES),
  timestamp: z.string(),
  result: ResultSchema,
  context: ContextSchema,
})

export type ProcessingReply = z.infer<typeof ProcessingReplySchema>

export const ProcessingEventSchemas = {
  request: ProcessingRequestSchema,
  reply: ProcessingReplySchema,
  status: ProcessingStatusSchema,
}
