import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { encryptValue, getConfigValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { InferenceHostConfig } from '@george-ai/event-service-client'

import { builder } from '../../builder'

// Result type for restore operation
const RestoreDefaultProvidersResult = builder.objectRef<{
  created: number
  skipped: number
  providerIds: string[]
}>('RestoreDefaultProvidersResult')

builder.objectType(RestoreDefaultProvidersResult, {
  fields: (t) => ({
    created: t.field({
      type: 'Int',
      nullable: false,
      resolve: (parent) => parent.created,
    }),
    skipped: t.field({
      type: 'Int',
      nullable: false,
      resolve: (parent) => parent.skipped,
    }),
    providers: t.field({
      type: ['InferenceHostConfig'],
      nullable: { list: false, items: false },
      resolve: async (parent) => {
        const items = await prisma.aiServiceProvider.findMany({
          where: { id: { in: parent.providerIds } },
        })
        return items.map(
          (item) =>
            ({
              type: 'inference-host',
              version: 1,
              workspaceId: item.workspaceId,
              hostId: item.id,
              name: item.name,
              connection: InferenceHostConnectionSchema.parse({
                driver: item.provider,
                baseUrl: item.baseUrl,
                encryptedApiKey: item.apiKey,
              }),
              enabled: item.enabled,
              configuredVramGb: item.vramGb ?? undefined,
              lastUpdate: item.updatedAt,
            }) satisfies InferenceHostConfig,
        )
      },
    }),
  }),
})

// Restore default providers from environment variables
builder.mutationField('restoreDefaultProviders', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: RestoreDefaultProvidersResult,
    nullable: false,
    resolve: async (_source, _args, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      const userId = session.user.id
      const providersToCreate: Array<Omit<InferenceHostConfig, 'hostId'>> = []

      const openAIApiKey = getConfigValue('OPENAI_API_KEY')
      const openAIBaseUrl = getConfigValue('OPENAI_BASE_URL')

      const encryptedOpenAIApiKey = encryptValue(openAIApiKey)
      // Import OpenAI if configured
      if (encryptedOpenAIApiKey) {
        providersToCreate.push({
          name: 'OpenAI',
          connection: { driver: 'openai', encryptedApiKey: encryptedOpenAIApiKey, baseUrl: openAIBaseUrl },
          version: 1,
          workspaceId,
          type: 'inference-host',
          enabled: true,
        })
      }

      // Import all configured Ollama instances
      for (const instance of getConfigValue('OLLAMA_INSTANCES')) {
        const encryptedApiKey = encryptValue(instance.apiKey)

        providersToCreate.push({
          name: instance.name,
          connection: {
            driver: 'ollama',
            baseUrl: instance.baseUrl,
            encryptedApiKey: encryptedApiKey,
          },
          version: 1,
          workspaceId,
          type: 'inference-host',
          enabled: true,
        })
      }

      // Create providers, skipping duplicates
      let created = 0
      let skipped = 0
      const createdProviders: Array<{ id: string }> = []

      for (const providerData of providersToCreate) {
        // Check if this specific provider (by name) already exists
        const existing = await prisma.aiServiceProvider.findFirst({
          where: {
            workspaceId,
            provider: providerData.connection.driver,
            name: providerData.name,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // For non-Ollama providers, disable others of same type before creating
        if (providerData.connection.driver !== 'ollama') {
          await prisma.aiServiceProvider.updateMany({
            where: {
              workspaceId,
              provider: providerData.connection.driver,
              enabled: true,
            },
            data: {
              enabled: false,
            },
          })
        }

        const encryptedApi = encryptValue(providerData.connection.encryptedApiKey || '')

        // Create new provider (enabled by default)
        const newProvider = await prisma.aiServiceProvider.create({
          data: {
            workspaceId,
            provider: providerData.connection.driver,
            name: providerData.name || `Unnamed ${providerData.connection.driver} Provider`,
            enabled: true,
            baseUrl: providerData.connection.baseUrl,
            apiKey: encryptedApi,
            createdBy: userId,
          },
        })

        createdProviders.push(newProvider)
        created++
      }

      // Invalidate provider cache for this workspace if any providers were created
      if (created > 0) {
        invalidateWorkspace(workspaceId)
      }

      return {
        created,
        skipped,
        providerIds: createdProviders.map((p) => p.id),
      }
    },
  }),
)
