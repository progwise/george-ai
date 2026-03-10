import { prisma } from '@george-ai/app-database'

import { logger } from './common'
import { ensureSystemWorkspace, invalidateWorkspace } from './workspace'

let initializeOncePromise: Promise<void> | null = null

export function initializeOnce(): Promise<void> {
  if (initializeOncePromise) {
    return initializeOncePromise
  }
  initializeOncePromise = initializeAppDomain()
  return initializeOncePromise
}

const initializeAppDomain = async () => {
  if (initializeOncePromise) {
    return initializeOncePromise
  }
  await ensureSystemWorkspace()

  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      providers: { where: { enabled: true } },
      languageModels: { where: { enabled: true } },
    },
  })

  const results = await Promise.allSettled(
    workspaces.map(async (workspace) => {
      logger.info(`Found workspace for initialization: ${workspace.id} - ${workspace.name}`)
      await invalidateWorkspace(workspace.id)
    }),
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      logger.info('Initialized workspace config successfully', { workspaceId: workspaces[index].id })
    } else {
      logger.error('Failed to initialize workspace config', { workspaceId: workspaces[index].id, error: result.reason })
    }
  })
}
