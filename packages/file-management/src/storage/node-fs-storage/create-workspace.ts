import { WorkspaceManifest } from '../../schemas'
import { createWorkspaceDir } from './directories'
import { saveWorkspaceManifest } from './metadata-files'

export async function createWorkspace(workspaceId: string, args: { name: string }): Promise<WorkspaceManifest> {
  const { name } = args
  const workspaceDir = await createWorkspaceDir(workspaceId)
  const manifest: WorkspaceManifest = {
    version: 1,
    id: workspaceId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {},
    usage: {
      sourceBytes: 0,
      extractedBytes: 0,
      activeExtractedBytes: 0,
      physicalBytes: 0,
      sourceFiles: 0,
      extractionFiles: 0,
      physicalFiles: 0,
      extractions: 0,
      lastUpdate: new Date().toISOString(),
      lastReconcile: undefined,
      activeExtractions: 0,
    },
  }
  await saveWorkspaceManifest(workspaceDir, manifest)
  return manifest
}
