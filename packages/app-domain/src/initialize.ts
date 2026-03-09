import { prisma } from '@george-ai/app-database'
import { InferenceDriverSchema, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { WorkspaceConfig, WorkspaceConfigSchema, writeRegistryEntry } from '@george-ai/event-service-client'

import { logger } from './common'
import { ensureSystemWorkspace } from './workspace'

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
    workspaces.map((workspace) => {
      logger.info(`Found workspace for initialization: ${workspace.id} - ${workspace.name}`)
      const entry: WorkspaceConfig = {
        workspaceId: workspace.id,
        modelHosts: workspace.providers.map((provider) => ({
          version: 1,
          hostId: provider.id,
          workspaceId: workspace.id,
          connection: InferenceHostConnectionSchema.parse({
            driver: provider.provider,
            baseUrl: provider.baseUrl || undefined,
            encryptedApiKey: provider.apiKey || undefined,
          }),
        })),
        activeModels: workspace.languageModels.map((model) => ({
          version: 1,
          id: model.id,
          name: model.name,
          driver: InferenceDriverSchema.parse(model.provider),
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
        })),
        version: 1,
        lastUpdate: new Date(),
        type: 'workspace',
      }

      return writeRegistryEntry(WorkspaceConfigSchema.parse(entry))
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
