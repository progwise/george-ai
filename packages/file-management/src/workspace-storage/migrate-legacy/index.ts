import { legacyFolderFiles } from './legacy-folder'
import { migrateDocument } from './migrate-document'
import { migrateLibrary } from './migrate-library'
import { migrateWorkspace } from './migrate-workspace'

export default { migrateWorkspace, migrateLibrary, migrateDocument }

export { migrateDocument, migrateLibrary, migrateWorkspace, legacyFolderFiles }
