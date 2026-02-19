import { getDocumentsPath } from '../entry'
import { reconcileLibrary } from '../reconcile/reconcile-library'

import { mkdir, rm } from 'fs/promises'

export async function clearDocuments(workspaceId: string, parameters: { libraryId: string }): Promise<void> {
  const { libraryId } = parameters

  const documentsPath = getDocumentsPath({ workspaceId, libraryId })

  await rm(documentsPath, { recursive: true, force: true })
  await mkdir(documentsPath, { recursive: true })

  await reconcileLibrary({
    workspaceId,
    libraryId,
    version: 1,
    type: 'library',
  })
}
