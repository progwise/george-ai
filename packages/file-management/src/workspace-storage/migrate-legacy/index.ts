import { migrateLegacyDocument } from './migrate-legacy-document'
import { migrateLegacyLibrary } from './migrate-legacy-library'
import { migrateWorkspace } from './migrate-workspace'

export default { migrateWorkspace, migrateLegacyLibrary, migrateLegacyDocument }

export { migrateLegacyDocument, migrateLegacyLibrary, migrateWorkspace }
