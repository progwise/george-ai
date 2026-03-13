import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { InferenceDriverSchema, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { InferenceHostConfig, writeRegistryEntry } from '@george-ai/event-service-client'

import { logger } from '../common'
import { DomainError } from '../error'

export async function updateInferenceHost(params: {
  workspaceId: string
  hostId: string
  baseUrl?: string | null
  apiKey?: string | null
  name?: string
  configuredVramGb?: number
}): Promise<InferenceHostConfig> {
  logger.debug('Updating inference host with params:', params)

  const { workspaceId, hostId, baseUrl, apiKey, name, configuredVramGb } = params

  const existingEntity = await prisma.aiServiceProvider.findFirstOrThrow({
    where: { workspaceId, id: hostId },
  })

  const driver = InferenceDriverSchema.parse(existingEntity.provider)

  const existingNames = await prisma.aiServiceProvider
    .findMany({
      where: { workspaceId, provider: driver, id: { not: hostId } },
      select: { name: true },
    })
    .then((results) => results.map((r) => r.name))

  if (name && existingNames.some((existingName) => existingName === name)) {
    throw new DomainError(
      `Inference host '${driver}' with name '${name}' already exists in this workspace`,
      'workspace',
    )
  }

  const entity = await prisma.aiServiceProvider.update({
    where: { id: hostId },
    data: {
      name: name ? name : existingEntity.name,
      baseUrl: baseUrl === null ? null : (baseUrl ?? existingEntity.baseUrl),
      apiKey: apiKey === null ? null : apiKey ? encryptValue(apiKey) : existingEntity.apiKey,
      vramGb: configuredVramGb === null ? null : (configuredVramGb ?? existingEntity.vramGb),
      updatedBy: 'system', // TODO: Pass actual user ID from session
    },
  })

  const hostConfig: InferenceHostConfig = {
    version: 1,
    type: 'inference-host',
    workspaceId,
    hostId: entity.id,
    enabled: entity.enabled,
    connection: InferenceHostConnectionSchema.parse({
      driver,
      baseUrl: entity.baseUrl,
      encryptedApiKey: entity.apiKey,
    }),
    name: entity.name,
    configuredVramGb: entity.vramGb ?? 0,
  }

  await writeRegistryEntry(hostConfig)
  return hostConfig
}
