import z from 'zod'

import {
  DocumentExtractionRequestSchema,
  DocumentExtractionStatusSchema,
  DocumentVectorizationRequestSchema,
  DocumentVectorizationStatusSchema,
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
import { WorkspaceStatsRequestSchema, WorkspaceStatsResponseSchema } from './workspace-stats'

export const WorkspaceRequestSchema = z.discriminatedUnion('action', [
  ChatRequestSchema,
  EmbeddingRequestSchema,
  DocumentExtractionRequestSchema,
  DocumentVectorizationRequestSchema,
  FieldEnrichmentRequestSchema,
  ConnectionTestRequestSchema,
  HealthStatusRequestSchema,
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
  DocumentExtractionStatusSchema,
  DocumentVectorizationStatusSchema,
  FieldEnrichmentStatusSchema,
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
])
export type EventQueueRequest = z.infer<typeof EventQueueRequestSchema>

export const EventQueueStatusSchema = z.discriminatedUnion('action', [
  DocumentExtractionStatusSchema,
  DocumentVectorizationStatusSchema,
  FieldEnrichmentStatusSchema,
])

export type EventQueueStatus = z.infer<typeof EventQueueStatusSchema>
