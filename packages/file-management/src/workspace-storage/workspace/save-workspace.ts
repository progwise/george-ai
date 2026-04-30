import { logger } from '../commons'
import { saveEntry } from '../entry'
import { WorkspaceManifest } from '../schema'

export async function saveWorkspace(workspace: WorkspaceManifest): Promise<void> {
  logger.debug('Saving workspace', workspace)
  await saveEntry(workspace)
}
