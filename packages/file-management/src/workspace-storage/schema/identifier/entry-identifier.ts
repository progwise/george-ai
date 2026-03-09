import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-schema'

import { BaseIdentifierSchema } from './base-identifier'

export const WorkspaceIdentifierSchema = BaseIdentifierSchema.extend({
  type: z.literal('workspace'),
  workspaceId: z.string().min(3),
})

export const LibraryIdentifierSchema = BaseIdentifierSchema.extend({
  type: z.literal('library'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
})

export const DocumentIdentifierSchema = BaseIdentifierSchema.extend({
  type: z.literal('document'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
})

export const ExtractionIdentifierSchema = BaseIdentifierSchema.extend({
  type: z.literal('extraction'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  extractionMethod: z.enum(EXTRACTION_METHODS),
})

export const EntryIdentifierSchema = z.discriminatedUnion('type', [
  WorkspaceIdentifierSchema,
  LibraryIdentifierSchema,
  DocumentIdentifierSchema,
  ExtractionIdentifierSchema,
])
