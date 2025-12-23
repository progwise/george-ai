import { classifyModel, discoverModels as discoverModelsForProvider } from '@george-ai/ai-service-client'

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
 * Queries each workspace's providers and deduplicates models globally
 */
async function discoverModels(workspaceId: string): Promise<DiscoveredModel[]> {
  const discoveredModels: DiscoveredModel[] = []

  // 1. Discover Ollama models for this workspace
  try {
    const ollamaModelNames = await discoverModelsForProvider(workspaceId, 'ollama')

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

    console.log(`✅ Discovered ${ollamaModelNames.length} Ollama models for workspace ${workspaceId}`)
  } catch (error) {
    console.warn(`⚠️ Ollama sync failed for workspace ${workspaceId}:`, error)
  }

  // 2. Discover OpenAI models for this workspace
  try {
    const openaiModelNames = await discoverModelsForProvider(workspaceId, 'openai')

    for (const name of openaiModelNames) {
      const classification = classifyModel(name)
      discoveredModels.push({
        name,
        provider: 'openai',
        canDoEmbedding: classification.isEmbeddingModel,
        canDoChatCompletion: classification.isChatModel,
        canDoVision: classification.isVisionModel,
        canDoFunctionCalling: classification.isChatModel,
      })
    }

    console.log(`✅ Discovered ${openaiModelNames.length} OpenAI models for workspace ${workspaceId}`)
  } catch (error) {
    console.warn(`⚠️ OpenAI sync failed for workspace ${workspaceId}:`, error)
  }

  return discoveredModels
}

/**
 * Syncs discovered models to database with upsert logic
 * Always updates capabilities on sync (auto-detection improvements propagate)
 * Disables models that are no longer available from their providers
 */
async function syncModelsToDatabase(workspaceId: string, discoveredModels: DiscoveredModel[]): Promise<number> {
  let syncedCount = 0

  await prisma.$transaction(async (tx) => {
    // Get unique providers from discovered models
    const activeProviders = [...new Set(discoveredModels.map((m) => m.provider))]

    // Upsert all discovered models (enable them if they exist)
    for (const model of discoveredModels) {
      await tx.aiLanguageModel.upsert({
        where: {
          workspaceId_provider_name: {
            workspaceId,
            provider: model.provider,
            name: model.name,
          },
        },
        update: {
          canDoEmbedding: model.canDoEmbedding,
          canDoChatCompletion: model.canDoChatCompletion,
          canDoVision: model.canDoVision,
          canDoFunctionCalling: model.canDoFunctionCalling,
          enabled: true, // Re-enable if it was previously disabled
        },
        create: {
          workspaceId,
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
        workspaceId,
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

// GraphQL mutation for syncing models
builder.mutationField('syncModels', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: SyncModelsResult,
    resolve: async (_source, _args, context) => {
      try {
        const discoveredModels = await discoverModels(context.workspaceId)
        const syncedCount = await syncModelsToDatabase(context.workspaceId, discoveredModels)

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

// GraphQL mutation for updating a language model
builder.mutationField('updateAiLanguageModel', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: UpdateAiLanguageModelInput, required: true }),
    },
    resolve: async (query, _root, { id, data }, context) => {
      return await prisma.aiLanguageModel.update({
        ...query,
        where: {
          id,
          workspaceId: context.workspaceId,
        },
        data: {
          adminNotes: data.adminNotes ?? null,
          enabled: data.enabled,
        },
      })
    },
  }),
)

// GraphQL mutation for disabling a language model
builder.mutationField('disableAiLanguageModel', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { id }, context) => {
      // Disable the model (set enabled: false)
      return await prisma.aiLanguageModel.update({
        ...query,
        where: {
          id,
          workspaceId: context.workspaceId,
        },
        data: { enabled: false },
      })
    },
  }),
)
