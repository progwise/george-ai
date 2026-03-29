import z from 'zod'

import {
  DocumentExtractionRequestSchema,
  DocumentExtractionStatusSchema,
  DocumentVectorizationRequestSchema,
  DocumentVectorizationStatusSchema,
  MigrateFileRequestSchema,
  MigrateFileStatusSchema,
} from './document'
import { FieldEnrichmentRequestSchema, FieldEnrichmentStatusSchema } from './enrichment'
import {
  ConnectionTestRequestSchema,
  ConnectionTestResponseSchema,
  HealthStatusRequestSchema,
  HealthStatusResponseSchema,
  ModelDiscoveryRequestSchema,
  ModelDiscoveryResponseSchema,
} from './host'
import { ChatRequestSchema, ChatResponseSchema, EmbeddingRequestSchema, EmbeddingResponseSchema } from './inference'
import { AnalyzeImageRequestSchema, AnalyzeImageStatusSchema } from './media'
import { WorkspaceStatsRequestSchema, WorkspaceStatsResponseSchema } from './workspace-stats'

export const WorkspaceRequestSchema = z.discriminatedUnion('action', [
  AnalyzeImageRequestSchema,
  ChatRequestSchema,
  EmbeddingRequestSchema,
  DocumentExtractionRequestSchema,
  DocumentVectorizationRequestSchema,
  FieldEnrichmentRequestSchema,
  ConnectionTestRequestSchema,
  HealthStatusRequestSchema,
  MigrateFileRequestSchema,
  ModelDiscoveryRequestSchema,
])

export type WorkspaceRequest = z.infer<typeof WorkspaceRequestSchema>

export const WorkspaceResponseSchema = z.discriminatedUnion('action', [
  ChatResponseSchema,
  EmbeddingResponseSchema,
  ConnectionTestResponseSchema,
  HealthStatusResponseSchema,
  ModelDiscoveryResponseSchema,
])

export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>

export const WorkspaceStatusSchema = z.discriminatedUnion('action', [
  AnalyzeImageStatusSchema,
  DocumentExtractionStatusSchema,
  DocumentVectorizationStatusSchema,
  FieldEnrichmentStatusSchema,
  MigrateFileStatusSchema,
])

export type WorkspaceStatus = z.infer<typeof WorkspaceStatusSchema>

export const SyncRequestSchema = z.discriminatedUnion('action', [
  ChatRequestSchema,
  EmbeddingRequestSchema,
  ConnectionTestRequestSchema,
  HealthStatusRequestSchema,
  ModelDiscoveryRequestSchema,
  WorkspaceStatsRequestSchema,
])

export type SyncRequest = z.infer<typeof SyncRequestSchema>

export const SyncResponseSchema = z.discriminatedUnion('action', [
  ChatResponseSchema,
  EmbeddingResponseSchema,
  ConnectionTestResponseSchema,
  HealthStatusResponseSchema,
  ModelDiscoveryResponseSchema,
  WorkspaceStatsResponseSchema,
])

export type SyncResponse = z.infer<typeof SyncResponseSchema>

export const EventQueueRequestSchema = z.discriminatedUnion('action', [
  DocumentExtractionRequestSchema,
  DocumentVectorizationRequestSchema,
  FieldEnrichmentRequestSchema,
  MigrateFileRequestSchema,
  AnalyzeImageRequestSchema,
])
export type EventQueueRequest = z.infer<typeof EventQueueRequestSchema>

export const EventQueueStatusSchema = z.discriminatedUnion('action', [
  DocumentExtractionStatusSchema,
  DocumentVectorizationStatusSchema,
  FieldEnrichmentStatusSchema,
  MigrateFileStatusSchema,
  AnalyzeImageStatusSchema,
])

export type EventQueueStatus = z.infer<typeof EventQueueStatusSchema>

export const AsyncEventSchema = z.union([EventQueueRequestSchema, EventQueueStatusSchema])
