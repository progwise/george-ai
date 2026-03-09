import { prisma } from '@george-ai/app-database'
import { InferenceDriverSchema, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { WorkspaceConfig, writeRegistryEntry } from '@george-ai/event-service-client'

export async function invalidateWorkspace(workspaceId: string) {
  const entity = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: {
      providers: true,
      languageModels: true,
    },
  })

  const config: WorkspaceConfig = {
    version: 1,
    workspaceId,
    modelHosts: entity.providers.map((provider) => ({
      connection: InferenceHostConnectionSchema.parse({
        driver: provider.provider,
        baseUrl: provider.baseUrl,
        encryptedApiKey: provider.apiKey,
      }),
      hostId: provider.id,
      version: 1,
      workspaceId,
      name: provider.name,
    })),
    activeModels: entity.languageModels.map((model) => ({
      ...model,
      driver: InferenceDriverSchema.parse(model.provider),
      version: 1,
    })),
    type: 'workspace',
  }

  await writeRegistryEntry(config)
}
