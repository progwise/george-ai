import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('event-service-client:workspace-config')
export const WORKSPACE_CONFIG_BUCKET_NAME = 'workspace-config'

export const getKey = (workspaceId: string) => `workspace.${workspaceId}.config`
