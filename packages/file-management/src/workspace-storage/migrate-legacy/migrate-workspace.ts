import { logger } from '../commons'
import { entryExists } from '../entry'
import { createWorkspace } from '../workspace'

export async function migrateWorkspace(
  workspaceId: string,
  args: {
    workspaceName: string
  },
): Promise<void> {
  const workspaceExists = await entryExists({ workspaceId, type: 'workspace', version: 1 })
  if (!workspaceExists) {
    logger.info('Workspace does not exist, creating before migration', { workspaceId })
    await createWorkspace(workspaceId, { name: args.workspaceName })
  }
}
