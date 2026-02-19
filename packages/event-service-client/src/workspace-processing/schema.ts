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

export const ExtractDocumentRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('extractFile'),
  libraryId: z.string(),
  documentId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ExtractDocumentRequest = z.infer<typeof ExtractDocumentRequestSchema>

// Embed file

export const EmbedDocumentRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('embedFile'),
  libraryId: z.string(),
  documentId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  embeddingModelProvider: z.enum(MODEL_PROVIDERS),
  embeddingModelName: z.string(),
})

export type EmbedDocumentRequest = z.infer<typeof EmbedDocumentRequestSchema>

// Enrich Item

export const EnrichItemRequestSchema = ProcessingRequestBaseSchema.extend({
  requestType: z.literal('enrichItem'),
  libraryId: z.string(),
  documentId: z.string(),
  fragment: z.number().nullable().optional(),
})

export type EnrichItemRequest = z.infer<typeof EnrichItemRequestSchema>

// Discriminated Union of all Requests

export const ProcessingRequestSchema = z.discriminatedUnion('requestType', [
  ExtractDocumentRequestSchema,
  EmbedDocumentRequestSchema,
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
export const ExtractDocumentStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('extractFile'),
  libraryId: z.string(),
  documentId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type ExtractDocumentStatus = z.infer<typeof ExtractDocumentStatusSchema>

// Embed File Status

export const EmbedDocumentStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('embedFile'),
  libraryId: z.string(),
  documentId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export type EmbedDocumentStatus = z.infer<typeof EmbedDocumentStatusSchema>

// Enrich Item Status

export const EnrichItemStatusSchema = ProcessingStatusBaseSchema.extend({
  requestType: z.literal('enrichItem'),
  libraryId: z.string(),
  documentId: z.string(),
  fragment: z.number().nullable().optional(),
})

export type EnrichItemStatus = z.infer<typeof EnrichItemStatusSchema>

// Discriminated Union of all Statuses

export const ProcessingStatusSchema = z.discriminatedUnion('requestType', [
  ExtractDocumentStatusSchema,
  EmbedDocumentStatusSchema,
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
