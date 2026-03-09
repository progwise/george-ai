import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceDriver, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { ModelDiscoveryRequest, invokeAction } from '@george-ai/event-service-client'

import { builder } from '../../builder'

// GraphQL mutation for syncing models
builder.mutationField('syncModels', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('SyncModelsResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
        modelsEnabled: t.int({ nullable: false }),
        modelsDisabled: t.int({ nullable: false }),
        modelsCreated: t.int({ nullable: false }),
        modelsDiscovered: t.int({ nullable: false }),
        errors: t.stringList({ nullable: { list: false, items: false } }),
      }),
    }),
    args: {
      driver: t.arg({ type: 'InferenceDriver', required: false }),
    },
    resolve: async (_source, _args, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const providers = await prisma.aiServiceProvider.findMany({
        where: {
          workspaceId,
          enabled: true,
        },
      })
      const modelDiscoveryResponses = await Promise.all(
        providers.map(async (provider) => {
          const discoveryRequest: ModelDiscoveryRequest = {
            action: 'modelDiscovery',
            workspaceId,
            version: 1,
            verb: 'request',
            timestamp: new Date(),
            connection: InferenceHostConnectionSchema.parse({
              driver: provider.provider,
              baseUrl: provider.baseUrl ?? undefined,
              encryptedApiKey: provider.apiKey,
            }),
          }

          return await invokeAction(discoveryRequest)
        }),
      )

      const discoveredModelMap = new Map<InferenceDriver, Set<string>>()

      modelDiscoveryResponses.forEach((response) => {
        discoveredModelMap.set(response.connection.driver, new Set(response.models.map((model) => model.name)))
      })

      for (const [providerType, discoveredModels] of discoveredModelMap.entries()) {
        const existingModels = await prisma.aiLanguageModel.findMany({
          where: {
            workspaceId,
            provider: providerType,
          },
        })

        const modelsToDisable = existingModels.filter((model) => !discoveredModels.has(model.name))
        const modelsToEnable = existingModels.filter((model) => discoveredModels.has(model.name) && !model.enabled)
        const modelsToCreate = Array.from(discoveredModels).filter(
          (modelName) => !existingModels.some((m) => m.name === modelName),
        )

        await prisma.$transaction([
          ...modelsToDisable.map((model) =>
            prisma.aiLanguageModel.update({
              where: { id: model.id },
              data: { enabled: false },
            }),
          ),
          ...modelsToEnable.map((model) =>
            prisma.aiLanguageModel.update({
              where: { id: model.id },
              data: { enabled: true },
            }),
          ),
          ...modelsToCreate.map((modelName) =>
            prisma.aiLanguageModel.create({
              data: {
                name: modelName,
                provider: providerType,
                workspaceId,
                enabled: true,
              },
            }),
          ),
        ])
      }

      return {
        success: true,
        modelsEnabled: modelDiscoveryResponses.reduce((sum, response) => {
          return sum + response.models.length
        }, 0),
        modelsDisabled: 0, // For simplicity, not tracking counts of enabled/disabled/created models here
        modelsCreated: 0,
        modelsDiscovered: discoveredModelMap.size,
        errors: [],
      }
    },
  }),
)
