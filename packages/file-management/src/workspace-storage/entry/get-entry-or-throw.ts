import {
  DocumentIdentifier,
  DocumentManifest,
  ExtractionIdentifier,
  ExtractionManifest,
  LibraryIdentifier,
  LibraryManifest,
  WorkspaceIdentifier,
  WorkspaceManifest,
} from '../schema'
import { getEntryInternal } from './get-entry-internal'

export async function getEntryOrThrow(id: WorkspaceIdentifier, errorMessage?: string): Promise<WorkspaceManifest>
export async function getEntryOrThrow(id: LibraryIdentifier, errorMessage?: string): Promise<LibraryManifest>
export async function getEntryOrThrow(id: DocumentIdentifier, errorMessage?: string): Promise<DocumentManifest>
export async function getEntryOrThrow(id: ExtractionIdentifier, errorMessage?: string): Promise<ExtractionManifest>
export async function getEntryOrThrow(
  id: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  errorMessage?: string,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest>
export async function getEntryOrThrow(
  id: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  errorMessage?: string,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest> {
  const manifest = await getEntryInternal(id)
  if (!manifest) {
    throw new Error(errorMessage || 'Manifest not found')
  }
  return manifest
}
