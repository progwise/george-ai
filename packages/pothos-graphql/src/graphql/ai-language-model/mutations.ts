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
 * Discovers models from all configured providers (Ollama, OpenAI)
 * Reuses existing ollamaResourceManager.getAvailableModelNames() for multi-instance support
 * Reuses existing classifyModel() for capability detection
 */
async function discoverModels(): Promise<DiscoveredModel[]> {
  const discoveredModels: DiscoveredModel[] = []

  // 1. Discover Ollama models (using existing resource manager)
  if (process.env.OLLAMA_BASE_URL) {
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
          canDoFunctionCalling: classification.isChatModel, // Chat models can do function calling
        })
      }

      console.log(`✅ Discovered ${ollamaModelNames.length} Ollama models`)
    } catch (error) {
      console.warn('⚠️ Ollama sync failed:', error)
      // Continue with other providers
    }
  }

  // 2. Discover OpenAI models (new)
  if (process.env.OPENAI_API_KEY) {
    try {
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
    } catch (error) {
      console.warn('⚠️ OpenAI sync failed:', error)
      // Continue even if OpenAI fails
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
          deleted: false,
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
        deleted: false,
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
    enabled: t.boolean({ required: false }),
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
      // Filter out null/undefined values
      const updateData: { adminNotes?: string; enabled?: boolean } = {}
      if (data.adminNotes !== null && data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes
      }
      if (data.enabled !== null && data.enabled !== undefined) {
        updateData.enabled = data.enabled
      }

      return await prisma.aiLanguageModel.update({
        ...query,
        where: { id },
        data: updateData,
      })
    },
  }),
)

// GraphQL mutation for soft-deleting a language model (admin-only)
builder.mutationField('deleteAiLanguageModel', (t) =>
  t.withAuth({ isLoggedIn: true, admin: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { id }) => {
      // Soft delete (set deleted: true, enabled: false)
      return await prisma.aiLanguageModel.update({
        ...query,
        where: { id },
        data: { deleted: true, enabled: false },
      })
    },
  }),
)
