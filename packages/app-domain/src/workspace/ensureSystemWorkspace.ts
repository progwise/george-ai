import { prisma } from '@george-ai/app-database'
import { writeWorkspaceConfig } from '@george-ai/event-service-client'
import { createWorkspace } from '@george-ai/file-management'

import { SYSTEM_WORKSPACE_ID, logger } from './common'
import { getWorkspaceManifest } from './get-workspace-manifest'

export async function ensureSystemWorkspace(): Promise<void> {
  const systemWorkspace = await prisma.workspace.findFirst({
    where: { id: SYSTEM_WORKSPACE_ID },
  })

  if (!systemWorkspace) {
    logger.info('System workspace not found, creating one...')
    await prisma.workspace.create({
      data: {
        name: 'Shared',
        id: SYSTEM_WORKSPACE_ID,
        slug: 'shared',
      },
    })
    logger.info('System workspace created successfully')
  } else {
    logger.info('System workspace already exists, no action needed')
  }

  const manifest = await getWorkspaceManifest(SYSTEM_WORKSPACE_ID).catch((error) => {
    logger.error('Error fetching system workspace manifest', { error })
    return null
  })
  if (!manifest) {
    logger.info('System workspace manifest not found, creating one...')
    await createWorkspace(SYSTEM_WORKSPACE_ID, { name: 'Shared', creator: 'system' })
    logger.info('System workspace manifest created successfully')
  } else {
    logger.info('System workspace manifest already exists, no action needed')
  }

  await writeWorkspaceConfig({
    languageModels: [],
    providerInstances: [],
    version: 1,
    workspaceId: SYSTEM_WORKSPACE_ID,
    lastUpdate: new Date(),
  })
}
