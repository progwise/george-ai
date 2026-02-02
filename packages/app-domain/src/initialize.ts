import { prisma } from '@george-ai/app-database'
import { workspaceConfig } from '@george-ai/event-service-client'

import { logger } from './common'

export const initializeAppDomain = async () => {
  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      aiProviders: { where: { enabled: true } },
      languageModels: { where: { enabled: true } },
    },
  })

  const results = await Promise.allSettled(
    workspaces.map((workspace) => {
      logger.info(`Found workspace for initialization: ${workspace.id} - ${workspace.name}`)
      const entry = workspaceConfig.WorkspaceConfigSchema.parse({
        workspaceId: workspace.id,
        providerInstances: workspace.aiProviders.map((provider) => ({
          id: provider.id,
          modelProvider: provider.provider,
          baseUrl: provider.baseUrl || undefined,
          apiKey: provider.apiKey || undefined,
        })),
        languageModels: workspace.languageModels.map((model) => ({
          id: model.id,
          name: model.name,
          modelProvider: model.provider,
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
        })),
        version: 1,
        lastUpdate: new Date().toISOString(),
      })
      return workspaceConfig.writeWorkspaceConfig(entry)
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
