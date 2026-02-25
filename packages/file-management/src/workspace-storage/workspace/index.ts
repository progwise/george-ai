import { migrateWorkspace } from '../migrate-legacy'
import { reconcileWorkspace } from '../reconcile'
import storageStats from '../storage-stats'
import { createWorkspace } from './create-workspace'
import { deleteWorkspace } from './delete-workspace'
import { existsWorkspace } from './exists-workspace'
import { getWorkspace } from './get-workspace'

export default {
  create: createWorkspace,
  delete: deleteWorkspace,
  exists: existsWorkspace,
  get: getWorkspace,
  reconcile: reconcileWorkspace,
  migrate: migrateWorkspace,
  storageStats,
}

export { createWorkspace, deleteWorkspace, getWorkspace, reconcileWorkspace, migrateWorkspace, existsWorkspace }
