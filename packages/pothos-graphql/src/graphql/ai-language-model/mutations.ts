import { classifyModel, getOllamaModelNames, getOpenAIModelNames } from '@george-ai/ai-service-client'

import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLanguageModel Mutations')

interface DiscoveredModel {
  name: string
  provider: string
  canDoEmbedding: boolean
  canDoChatCompletion: boolean
  canDoVision: boolean
  canDoFunctionCalling: boolean
}

/**
 * Discovers models from all configured workspace providers
 * Reads from AiServiceProvider table instead of .env
 * Deduplicates providers by type + baseUrl
 */
async function discoverModels(): Promise<DiscoveredModel[]> {
  const discoveredModels: DiscoveredModel[] = []

  // Get all enabled providers from database (across all workspaces)
  const providers = await prisma.aiServiceProvider.findMany({
    where: { enabled: true },
  })

  // Deduplicate providers by type + baseUrl (same instance might be used by multiple workspaces)
  const uniqueProviders = new Map<string, (typeof providers)[0]>()
  for (const provider of providers) {
    const key = `${provider.provider}:${provider.baseUrl || 'default'}`
    if (!uniqueProviders.has(key)) {
      uniqueProviders.set(key, provider)
    }
  }

  // 1. Discover Ollama models
  const ollamaProviders = Array.from(uniqueProviders.values()).filter((p) => p.provider === 'ollama')
  if (ollamaProviders.length > 0) {
    try {
      // Use existing method - already handles multi-instance deduplication!
      const ollamaModelNames = await getOllamaModelNames()

      for (const name of ollamaModelNames) {
        const classification = classifyModel(name)
        discoveredModels.push({
          name,
          provider: 'ollama',
          canDoEmbedding: classification.isEmbeddingModel,
          canDoChatCompletion: classification.isChatModel,
          canDoVision: classification.isVisionModel,
          canDoFunctionCalling: classification.isChatModel,
        })
      }

      console.log(`✅ Discovered ${ollamaModelNames.length} Ollama models from ${ollamaProviders.length} instances`)
    } catch (error) {
      console.warn('⚠️ Ollama sync failed:', error)
    }
  }

  // 2. Discover OpenAI models
  const openaiProviders = Array.from(uniqueProviders.values()).filter((p) => p.provider === 'openai')
  if (openaiProviders.length > 0) {
    try {
      // For now, use the first OpenAI provider's API key
      // All OpenAI providers access the same global model list
      const openaiProvider = openaiProviders[0]
      if (openaiProvider.apiKey) {
        const response = await getOpenAIModelNames()

        for (const model of response) {
          const classification = classifyModel(model)
          discoveredModels.push({
            name: model,
            provider: 'openai',
            canDoEmbedding: classification.isEmbeddingModel,
            canDoChatCompletion: classification.isChatModel,
            canDoVision: classification.isVisionModel,
            canDoFunctionCalling: classification.isChatModel,
          })
        }

        console.log(`✅ Discovered ${response.length} OpenAI models`)
      }
    } catch (error) {
      console.warn('⚠️ OpenAI sync failed:', error)
    }
  }

  return discoveredModels
}

/**
 * Syncs discovered models to database with upsert logic
 * Always updates capabilities on sync (auto-detection improvements propagate)
 * Disables models that are no longer available from their providers
 */
async function syncModelsToDatabase(discoveredModels: DiscoveredModel[]): Promise<number> {
  let syncedCount = 0

  await prisma.$transaction(async (tx) => {
    // Get unique providers from discovered models
    const activeProviders = [...new Set(discoveredModels.map((m) => m.provider))]

    // Upsert all discovered models (enable them if they exist)
    for (const model of discoveredModels) {
      await tx.aiLanguageModel.upsert({
        where: { provider_name: { provider: model.provider, name: model.name } },
        update: {
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
          enabled: true, // Re-enable if it was previously disabled
        },
        create: {
          name: model.name,
          provider: model.provider,
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
          enabled: true,
        },
      })
      syncedCount++
    }

    // Disable models that are no longer available from their providers
    // Only affects providers that were successfully synced in this run
    const discoveredModelKeys = new Set(discoveredModels.map((m) => `${m.provider}:${m.name}`))

    const existingModels = await tx.aiLanguageModel.findMany({
      where: {
        provider: { in: activeProviders },
      },
      select: { id: true, provider: true, name: true },
    })

    for (const existingModel of existingModels) {
      const modelKey = `${existingModel.provider}:${existingModel.name}`
      if (!discoveredModelKeys.has(modelKey)) {
        // This model exists in the database but was not discovered from the provider
        // Disable it (but don't delete - preserve historical data)
        await tx.aiLanguageModel.update({
          where: { id: existingModel.id },
          data: { enabled: false },
        })
        console.log(
          `⚠️ Disabled model ${existingModel.provider}:${existingModel.name} (no longer available from provider)`,
        )
      }
    }
  })

  return syncedCount
}

// Define SyncModelsResult type
const SyncModelsResult = builder.simpleObject('SyncModelsResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    modelsDiscovered: t.int({ nullable: false }),
    errors: t.stringList({ nullable: { list: false, items: false } }),
  }),
})

// GraphQL mutation for syncing models (admin-only)
builder.mutationField('syncModels', (t) =>
  t.withAuth({ isLoggedIn: true, admin: true }).field({
    type: SyncModelsResult,
    resolve: async () => {
      try {
        const discoveredModels = await discoverModels()
        const syncedCount = await syncModelsToDatabase(discoveredModels)

        return {
          success: true,
          modelsDiscovered: syncedCount,
          errors: [],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Model sync failed:', errorMessage)

        return {
          success: false,
          modelsDiscovered: 0,
          errors: [errorMessage],
        }
      }
    },
  }),
)

// Define UpdateAiLanguageModelInput type
const UpdateAiLanguageModelInput = builder.inputType('UpdateAiLanguageModelInput', {
  fields: (t) => ({
    adminNotes: t.string({ required: false }),
    enabled: t.boolean({ required: true }),
  }),
})

// GraphQL mutation for updating a language model (admin-only)
builder.mutationField('updateAiLanguageModel', (t) =>
  t.withAuth({ isLoggedIn: true, admin: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: UpdateAiLanguageModelInput, required: true }),
    },
    resolve: async (query, _root, { id, data }) => {
      return await prisma.aiLanguageModel.update({
        ...query,
        where: { id },
        data: {
          adminNotes: data.adminNotes ?? null,
          enabled: data.enabled,
        },
      })
    },
  }),
)

// GraphQL mutation for disabling a language model (admin-only)
builder.mutationField('disableAiLanguageModel', (t) =>
  t.withAuth({ isLoggedIn: true, admin: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { id }) => {
      // Disable the model (set enabled: false)
      return await prisma.aiLanguageModel.update({
        ...query,
        where: { id },
        data: { enabled: false },
      })
    },
  }),
)
