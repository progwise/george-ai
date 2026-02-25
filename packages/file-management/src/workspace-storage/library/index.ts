import { migrateWorkspace } from '../migrate-legacy'
import { reconcileLibrary } from '../reconcile'
import storageStats from '../storage-stats'
import { clearDocuments } from './clear-documents'
import { createLibrary } from './create-library'
import { deleteLibrary } from './delete-library'
import { existsLibrary } from './exists-library'
import { getLibrary } from './get-library'
import { moveLibrary } from './move-library'
import { updateLibrary } from './update-library'

export default {
  create: createLibrary,
  delete: deleteLibrary,
  exists: existsLibrary,
  get: getLibrary,
  reconcile: reconcileLibrary,
  migrate: migrateWorkspace,
  move: moveLibrary,
  update: updateLibrary,
  clearDocuments,
  storageStats,
}
export { createLibrary, deleteLibrary, getLibrary, moveLibrary, updateLibrary, clearDocuments, existsLibrary }
