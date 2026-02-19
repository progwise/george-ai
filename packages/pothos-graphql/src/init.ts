import { initializeWorkspace as initWorkspaceCache } from '@george-ai/ai-service-client'
import { workspace } from '@george-ai/app-domain'

import { logger } from './graphql/common'
import { startEnrichmentQueueWorker } from './worker-queue'

logger.info('Initializing workspace provider cache...')
initWorkspaceCache(workspace.getWorkspaceProviders)

// Start workers
if (process.env.AUTOSTART_ENRICHMENT_WORKER === 'true') {
  logger.info('Auto-starting enrichment queue worker...')
  startEnrichmentQueueWorker().catch((error) => logger.error('Enrichment worker error:', error))
}
