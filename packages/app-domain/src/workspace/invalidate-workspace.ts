import z from 'zod'

import { prisma } from '@george-ai/app-database'
import { InferenceDriverSchema, InferenceHostConnectionSchema, InferenceModelSchema } from '@george-ai/app-schema'
import {
  InferenceHostConfigBaseSchema,
  WorkspaceConfig,
  getRegistryEntry,
  writeRegistryEntry,
} from '@george-ai/event-service-client'

export async function invalidateWorkspace(workspaceId: string) {
  const originalConfig = await getRegistryEntry({ type: 'workspace', workspaceId })

  const entity = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: {
      name: true,
      providers: true,
      languageModels: true,
    },
  })

  const config: WorkspaceConfig = {
    version: 1,
    type: 'workspace',
    workspaceId,
    name: entity.name,
    inferenceHosts: entity.providers.map((provider) =>
      InferenceHostConfigBaseSchema.parse({
        connection: InferenceHostConnectionSchema.parse({
          driver: provider.provider,
          baseUrl: provider.baseUrl ?? undefined,
          encryptedApiKey: provider.apiKey ?? undefined,
        }),
        hostId: provider.id,
        name: provider.name,
        enabled: provider.enabled,
        configuredVramGb: provider.vramGb ?? undefined,
        lastUpdate: provider.updatedAt,
      } satisfies z.input<typeof InferenceHostConfigBaseSchema>),
    ),
    inferenceModels: entity.languageModels.map((model) =>
      InferenceModelSchema.parse({
        workspaceId,
        name: model.name,
        driver: InferenceDriverSchema.parse(model.provider),
        canDoEmbedding: model.canDoEmbedding,
        canDoChatCompletion: model.canDoChatCompletion,
        canDoFunctionCalling: model.canDoFunctionCalling,
        canDoVision: model.canDoVision,
        enabled: model.enabled,
      } satisfies z.input<typeof InferenceModelSchema>),
    ),
  }

  const normalize = (c: typeof config) => ({
    ...c,
    lastUpdate: undefined, // Ignore lastUpdate in comparison since it will always be different
    inferenceHosts: [...c.inferenceHosts].sort((a, b) => a.hostId.localeCompare(b.hostId)),
    inferenceModels: [...c.inferenceModels].sort((a, b) => a.name.localeCompare(b.name)),
  })

  if (originalConfig && JSON.stringify(normalize(originalConfig)) === JSON.stringify(normalize(config))) return

  await writeRegistryEntry(config)
}
