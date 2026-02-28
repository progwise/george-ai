import { getModelProvider } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { WorkspaceConfig, writeWorkspaceConfig } from '@george-ai/event-service-client'

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
    providerInstances: entity.providers.map((provider) => ({
      connection: {
        baseUrl: provider.baseUrl,
        encryptedApiKey: provider.apiKey,
      },
      modelProvider: getModelProvider(provider.provider),
      providerInstanceId: provider.id,
      version: 1,
      workspaceId,
      name: provider.name,
    })),
    languageModels: entity.languageModels.map((model) => ({
      ...model,
      modelProvider: getModelProvider(model.provider),
      version: 1,
    })),
  }

  await writeWorkspaceConfig(config)
}
