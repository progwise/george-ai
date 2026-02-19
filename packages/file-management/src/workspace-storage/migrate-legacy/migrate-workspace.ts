import { logger } from '../commons'
import { entryExists } from '../entry'
import { createWorkspace } from '../workspace'
import { LegacyFileLoader } from './legacy-file-loader'
import { migrateLegacyLibrary } from './migrate-legacy-library'

export async function migrateWorkspace(
  workspaceId: string,
  args: {
    workspaceName: string
    libraries: {
      id: string
      name: string
    }[]
    fileInfoLoader: LegacyFileLoader
  },
): Promise<void> {
  const workspaceExists = await entryExists({ workspaceId, type: 'workspace', version: 1 })
  if (!workspaceExists) {
    logger.info('Workspace does not exist, creating before migration', { workspaceId })
    await createWorkspace(workspaceId, { name: args.workspaceName })
  }

  for (const library of args.libraries) {
    logger.info('Starting migration for library in workspace', { workspaceId, libraryId: library.id })
    await migrateLegacyLibrary(workspaceId, {
      libraryId: library.id,
      libraryName: library.name,
      workspaceName: args.workspaceName,
      fileInfoLoader: args.fileInfoLoader,
    })
  }
}
