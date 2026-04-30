import z from 'zod'

import { DocumentManifestSchema } from './document-manifest'
import { ExtractionManifestSchema } from './extraction-manifest'
import { LibraryManifestSchema } from './library-manifest'
import { WorkspaceManifestSchema } from './workspace-manifest'

export const EntryManifestSchema = z.discriminatedUnion('type', [
  WorkspaceManifestSchema,
  DocumentManifestSchema,
  LibraryManifestSchema,
  ExtractionManifestSchema,
])
