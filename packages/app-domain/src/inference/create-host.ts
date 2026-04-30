import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { InferenceDriver, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { InferenceHostConfig, writeRegistryEntry } from '@george-ai/event-service-client'

import { logger } from '../common'
import { DomainError } from '../error'

export async function createInferenceHost(params: {
  workspaceId: string
  driver: InferenceDriver
  baseUrl?: string
  apiKey?: string
  name?: string
  configuredVramGb?: number
}): Promise<InferenceHostConfig> {
  logger.debug('Creating inference host with params:', params)

  const { workspaceId, driver, baseUrl, apiKey, name, configuredVramGb } = params

  const existingName = await prisma.aiServiceProvider.count({
    where: { workspaceId, provider: driver, name },
  })

  if (existingName > 0) {
    throw new DomainError(`Provider '${driver}' with name '${name}' already exists in this workspace`, 'workspace')
  }

  const entity = await prisma.aiServiceProvider.create({
    data: {
      name: name ?? `${driver} host`,
      provider: driver,
      baseUrl,
      apiKey: apiKey ? encryptValue(apiKey) : undefined,
      enabled: true,
      workspaceId,
      vramGb: configuredVramGb,
      createdBy: 'system', // TODO: Pass actual user ID from session
    },
  })

  const hostConfig: InferenceHostConfig = {
    version: 1,
    type: 'inference-host',
    workspaceId,
    hostId: entity.id,
    enabled: true,
    connection: InferenceHostConnectionSchema.parse({
      driver,
      baseUrl,
      encryptedApiKey: entity.apiKey,
    }),
    name: entity.name,
    configuredVramGb,
  }

  try {
    await writeRegistryEntry(hostConfig)
  } catch (error) {
    logger.error('Failed to write inference host config to registry, rolling back database entry', {
      error,
      hostConfig,
    })
    // TODO: Consider if writeRegistryEntry is atomic and does not need a cleanup.
    await prisma.aiServiceProvider.delete({ where: { id: entity.id } })
    throw new DomainError('Failed to register inference host configuration. Please try again.', 'inference')
  }
  return hostConfig
}
