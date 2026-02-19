import z from 'zod'

import {
  DocumentIdentifierSchema,
  ExtractionIdentifierSchema,
  LibraryIdentifierSchema,
  WorkspaceIdentifierSchema,
} from './identifier'
import {
  AttachmentSchema,
  DocumentManifestSchema,
  EntryManifestSchema,
  ExtractionManifestSchema,
  LibraryManifestSchema,
  StorageStatsSchema,
  WorkspaceManifestSchema,
} from './manifest'

export {
  AttachmentSchema,
  EntryManifestSchema,
  DocumentIdentifierSchema,
  ExtractionIdentifierSchema,
  LibraryIdentifierSchema,
  WorkspaceIdentifierSchema,
  LibraryManifestSchema,
  WorkspaceManifestSchema,
  DocumentManifestSchema,
  ExtractionManifestSchema,
  StorageStatsSchema,
}

export type Attachment = z.infer<typeof AttachmentSchema>

export type LibraryManifest = z.infer<typeof LibraryManifestSchema>
export type WorkspaceManifest = z.infer<typeof WorkspaceManifestSchema>
export type DocumentManifest = z.infer<typeof DocumentManifestSchema>
export type ExtractionManifest = z.infer<typeof ExtractionManifestSchema>
export type StorageStats = z.infer<typeof StorageStatsSchema>

export type DocumentIdentifier = z.infer<typeof DocumentIdentifierSchema>
export type ExtractionIdentifier = z.infer<typeof ExtractionIdentifierSchema>
export type LibraryIdentifier = z.infer<typeof LibraryIdentifierSchema>
export type WorkspaceIdentifier = z.infer<typeof WorkspaceIdentifierSchema>
