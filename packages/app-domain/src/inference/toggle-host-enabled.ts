import { prisma } from '@george-ai/app-database'
import { InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { InferenceHostConfig, writeRegistryEntry } from '@george-ai/event-service-client'

export async function toggleInferenceHostEnabled(params: {
  workspaceId: string
  hostId: string
  enabled: boolean
}): Promise<InferenceHostConfig> {
  const { hostId, workspaceId, enabled } = params

  const providerEntity = await prisma.aiServiceProvider.findFirstOrThrow({
    where: { workspaceId, id: hostId },
  })

  const updatedConfig: InferenceHostConfig = {
    type: 'inference-host',
    version: 1,
    workspaceId,
    hostId,
    name: providerEntity.name,
    connection: InferenceHostConnectionSchema.parse({
      driver: providerEntity.provider,
      baseUrl: providerEntity.baseUrl,
      encryptedApiKey: providerEntity.apiKey,
    }),
    enabled,
  }

  await writeRegistryEntry(updatedConfig)
  await prisma.aiServiceProvider.update({
    where: { id: hostId, workspaceId },
    data: {
      enabled,
    },
  })

  return updatedConfig
}
