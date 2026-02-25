import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { encryptValue, getConfigValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'
import { ModelProviderInstance } from '@george-ai/event-service-client'

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
    providers: t.prismaField({
      type: ['AiServiceProvider'],
      nullable: { list: false, items: false },
      resolve: async (query, parent) => {
        return prisma.aiServiceProvider.findMany({
          ...query,
          where: { id: { in: parent.providerIds } },
        })
      },
    }),
  }),
})

// Restore default providers from environment variables
builder.mutationField('restoreDefaultProviders', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: RestoreDefaultProvidersResult,
    nullable: false,
    resolve: async (_source, _args, context) => {
      await canAdminWorkspaceOrThrow(context.workspaceId, context.session.user.id)

      const userId = context.session.user.id
      const workspaceId = context.workspaceId
      const providersToCreate: Array<Omit<ModelProviderInstance, 'id'>> = []

      const apiKey = getConfigValue('OPENAI_API_KEY')
      const baseUrl = getConfigValue('OPENAI_BASE_URL')
      // Import OpenAI if configured
      if (apiKey) {
        providersToCreate.push({
          modelProvider: 'openai',
          name: 'OpenAI',
          connection: { version: 1, apiKey, baseUrl },
          version: 1,
        })
      }

      // Import all configured Ollama instances
      for (const instance of getConfigValue('OLLAMA_INSTANCES')) {
        providersToCreate.push({
          modelProvider: 'ollama',
          name: instance.name,
          connection: {
            version: 1,
            baseUrl: instance.baseUrl,
            apiKey: instance.apiKey,
          },
          version: 1,
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
            provider: providerData.modelProvider,
            name: providerData.name,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // For non-Ollama providers, disable others of same type before creating
        if (providerData.modelProvider !== 'ollama') {
          await prisma.aiServiceProvider.updateMany({
            where: {
              workspaceId,
              provider: providerData.modelProvider,
              enabled: true,
            },
            data: {
              enabled: false,
            },
          })
        }

        const encryptedApi = encryptValue(providerData.connection.apiKey || '')

        // Create new provider (enabled by default)
        const newProvider = await prisma.aiServiceProvider.create({
          data: {
            workspaceId,
            provider: providerData.modelProvider,
            name: providerData.name || `Unnamed ${providerData.modelProvider} Provider`,
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
