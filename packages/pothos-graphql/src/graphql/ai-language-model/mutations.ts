import { classifyModel, getOpenAIModels, ollamaResourceManager } from '@george-ai/ai-service-client'

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
      const ollamaModelNames = await ollamaResourceManager.getAvailableModelNames()

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
      const response = await getOpenAIModels({
        url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
      })

      for (const model of response.data) {
        const classification = classifyModel(model.id)
        discoveredModels.push({
          name: model.id,
          provider: 'openai',
          canDoEmbedding: classification.isEmbeddingModel,
          canDoChatCompletion: classification.isChatModel,
          canDoVision: classification.isVisionModel,
          canDoFunctionCalling: classification.isChatModel,
        })
      }

      console.log(`✅ Discovered ${response.data.length} OpenAI models`)
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
 */
async function syncModelsToDatabase(discoveredModels: DiscoveredModel[]): Promise<number> {
  let syncedCount = 0

  await prisma.$transaction(async (tx) => {
    for (const model of discoveredModels) {
      // Always upsert - update capabilities on every sync
      await tx.aiLanguageModel.upsert({
        where: { provider_name: { provider: model.provider, name: model.name } },
        update: {
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
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
