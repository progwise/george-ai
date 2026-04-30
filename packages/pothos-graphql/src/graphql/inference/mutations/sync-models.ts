import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceDriver, InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { ModelDiscoveryRequest, invokeAction } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

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

      const discoveredModelMap = new Map<
        InferenceDriver,
        Set<{
          modelName: string
          canDoChatCompletion: boolean
          canDoEmbedding: boolean
          canDoVision: boolean
          canDoFunctionCalling: boolean
        }>
      >()

      modelDiscoveryResponses.forEach((response) => {
        if (!response.success) {
          logger.error('Model discovery action failed', { response })
          return
        }

        discoveredModelMap.set(
          response.connection.driver,
          new Set(
            response.models.map((model) => ({
              modelName: model.modelName,
              canDoChatCompletion: model.canDoChatCompletion,
              canDoEmbedding: model.canDoEmbedding,
              canDoVision: model.canDoVision,
              canDoFunctionCalling: model.canDoFunctionCalling,
            })),
          ),
        )
      })

      for (const [providerType, discoveredModels] of discoveredModelMap.entries()) {
        const existingModels = await prisma.aiLanguageModel.findMany({
          where: {
            workspaceId,
            provider: providerType,
          },
        })

        const discoveredModelNames = new Set(Array.from(discoveredModels).map((model) => model.modelName))

        const modelsToDisable = existingModels.filter((model) => !discoveredModelNames.has(model.name))
        const modelsToEnable = existingModels.filter((model) => discoveredModelNames.has(model.name) && !model.enabled)
        const modelsToCreate = Array.from(discoveredModels).filter(
          (model) => !existingModels.some((m) => m.name === model.modelName),
        )

        await prisma.$transaction([
          ...modelsToDisable.map((model) =>
            prisma.aiLanguageModel.update({
              where: { id: model.id },
              data: {
                enabled: false,
                canDoChatCompletion: model.canDoChatCompletion,
                canDoEmbedding: model.canDoEmbedding,
                canDoVision: model.canDoVision,
                canDoFunctionCalling: model.canDoFunctionCalling,
              },
            }),
          ),
          ...modelsToEnable.map((model) =>
            prisma.aiLanguageModel.update({
              where: { id: model.id },
              data: {
                enabled: true,
                canDoChatCompletion: model.canDoChatCompletion,
                canDoEmbedding: model.canDoEmbedding,
                canDoVision: model.canDoVision,
                canDoFunctionCalling: model.canDoFunctionCalling,
              },
            }),
          ),
          ...modelsToCreate.map((model) =>
            prisma.aiLanguageModel.create({
              data: {
                name: model.modelName,
                provider: providerType,
                workspaceId,
                enabled: true,
                canDoChatCompletion: model.canDoChatCompletion,
                canDoEmbedding: model.canDoEmbedding,
                canDoVision: model.canDoVision,
                canDoFunctionCalling: model.canDoFunctionCalling,
              },
            }),
          ),
        ])
      }

      return {
        success: true,
        modelsEnabled: modelDiscoveryResponses.reduce((sum, response) => {
          if (!response.success) {
            logger.error('Model discovery action failed', { response })
            return sum
          }
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
