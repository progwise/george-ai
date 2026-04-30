import { logger } from '../commons'
import {
  DocumentIdentifier,
  ExtractionIdentifier,
  LibraryIdentifier,
  LibraryManifest,
  WorkspaceIdentifier,
  WorkspaceManifest,
} from '../schema'
import { reconcileDocument } from './reconcile-document'
import { reconcileExtraction } from './reconcile-extraction'
import { reconcileLibrary } from './reconcile-library'
import { reconcileWorkspace } from './reconcile-workspace'

export async function reconcile(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<WorkspaceManifest | LibraryManifest | DocumentIdentifier | ExtractionIdentifier> {
  logger.info('Starting reconciliation process', { identifier })
  switch (identifier.type) {
    case 'document':
      return await reconcileDocument(identifier)
    case 'library':
      return await reconcileLibrary(identifier)
    case 'workspace':
      return await reconcileWorkspace(identifier)
    case 'extraction':
      return await reconcileExtraction(identifier)
    default:
      throw new Error(`Unsupported identifier type: ${identifier}`)
  }
}
