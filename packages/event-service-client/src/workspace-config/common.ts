export const WORKSPACE_CONFIG_BUCKET_NAME = 'workspace-config'

export const getKey = (workspaceId: string) => `workspace.${workspaceId}.config`
