import { initializeWorkspace as initWorkspaceCache } from '@george-ai/ai-service-client'

import { getWorkspaceProviders } from './get-workspace-providers'

/**
 * Initialize the workspace provider cache
 * Call this once on application startup
 */
export const initializeWorkspace = () => {
  console.log('Initializing workspace provider cache...')
  initWorkspaceCache(getWorkspaceProviders)
  console.log('Workspace provider cache initialized')
}
