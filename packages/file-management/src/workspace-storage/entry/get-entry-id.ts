import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export function getEntryId(
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier,
) {
  switch (identifier.type) {
    case 'workspace':
      return identifier.workspaceId
    case 'library':
      return identifier.libraryId
    case 'document':
      return identifier.documentId
    case 'extraction':
      return identifier.extractionMethod
  }
}
