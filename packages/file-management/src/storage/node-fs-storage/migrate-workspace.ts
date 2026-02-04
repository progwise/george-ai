import { logger } from './commons'
import { createWorkspace } from './create-workspace'
import { exists } from './exists'
import { migrateLegacyLibrary } from './migrate-legacy-library'

export async function migrateWorkspace(
  workspaceId: string,
  args: {
    workspaceName: string
    libraries: {
      id: string
      name: string
    }[]
    fileInfoLoader: (fileId: string) => Promise<{
      workspaceId: string
      libraryId: string
      fileId: string
      fileName: string
      mimeType: string
      createdAt: string
      uploadedAt?: string | null
      hash?: string | null
    }>
  },
): Promise<void> {
  const workspaceExists = await exists(workspaceId, {})
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
