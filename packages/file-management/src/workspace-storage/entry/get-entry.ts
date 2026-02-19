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

export async function getEntry(id: WorkspaceIdentifier): Promise<WorkspaceManifest | null>
export async function getEntry(id: LibraryIdentifier): Promise<LibraryManifest | null>
export async function getEntry(id: DocumentIdentifier): Promise<DocumentManifest | null>
export async function getEntry(id: ExtractionIdentifier): Promise<ExtractionManifest | null>
export async function getEntry(
  id: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest | null>
export async function getEntry(
  id: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest | null> {
  return await getEntryInternal(id).catch((error) => {
    if (error.code === 'ENOENT') {
      return null
    }
    throw error
  })
}
