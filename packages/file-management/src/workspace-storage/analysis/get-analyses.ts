import { getEntry } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export async function getAnalysisList(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
) {
  const parent = await getEntry(identifier)
  if (!parent) {
    return []
  }
  const files = parent.analyses.map((analysis) => analysis.analysisFileName)
  return files
}
