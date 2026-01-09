import { GraphQLError } from 'graphql'

import { invalidateWorkspace, testOllamaConnection, testOpenAIConnection } from '@george-ai/ai-service-client'
import { prisma } from '@george-ai/app-domain'
import { encryptValue } from '@george-ai/web-utils'

import { OLLAMA_INSTANCES, OPENAI_API_KEY, OPENAI_BASE_URL } from '../../global-config'
import { builder } from '../builder'

// Input type for creating/updating AI service providers
const AiServiceProviderInput = builder.inputType('AiServiceProviderInput', {
  fields: (t) => ({
    provider: t.string({ required: true }),
    name: t.string({ required: true }),
    enabled: t.boolean({ required: false }),
    baseUrl: t.string({ required: false }),
    apiKey: t.string({ required: false }),
    vramGb: t.int({ required: false }),
  }),
})

// Create a new AI service provider
builder.mutationField('createAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      data: t.arg({ type: AiServiceProviderInput, required: true }),
    },
    resolve: async (query, _source, { data }, context) => {
      const userId = context.session.user.id

      // Check for duplicate name within same provider type
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          workspaceId: context.workspaceId,
          provider: data.provider,
          name: data.name,
        },
      })

      if (existing) {
        throw new GraphQLError(`Provider '${data.provider}' with name '${data.name}' already exists in this workspace`)
      }

      // For non-Ollama providers, if enabling this provider, disable others of same type
      const shouldEnable = data.enabled ?? true
      if (shouldEnable && data.provider !== 'ollama') {
        await prisma.aiServiceProvider.updateMany({
          where: {
            workspaceId: context.workspaceId,
            provider: data.provider,
            enabled: true,
          },
          data: {
            enabled: false,
          },
        })
      }
      if (data.apiKey == undefined) {
        throw new Error('API key is required')
      }
      const encryptedApi = encryptValue(data.apiKey)

      const provider = await prisma.aiServiceProvider.create({
        ...query,
        data: {
          workspaceId: context.workspaceId,
          provider: data.provider,
          name: data.name,
          enabled: shouldEnable,
          baseUrl: data.baseUrl,
          apiKey: encryptedApi,
          vramGb: data.vramGb,
          createdBy: userId,
        },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(context.workspaceId)

      return provider
    },
  }),
)

// Update an existing AI service provider
builder.mutationField('updateAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: AiServiceProviderInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      const userId = context.session.user.id

      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Provider not found or access denied')
      }

      // Check for duplicate name if provider/name changed
      if (data.provider !== existing.provider || data.name !== existing.name) {
        const duplicate = await prisma.aiServiceProvider.findFirst({
          where: {
            workspaceId: context.workspaceId,
            provider: data.provider,
            name: data.name,
            id: { not: String(id) },
          },
        })

        if (duplicate) {
          throw new GraphQLError(
            `Provider '${data.provider}' with name '${data.name}' already exists in this workspace`,
          )
        }
      }

      // For non-Ollama providers, if enabling this provider, disable others of same type
      const shouldEnable = data.enabled ?? existing.enabled
      if (shouldEnable && data.provider !== 'ollama') {
        await prisma.aiServiceProvider.updateMany({
          where: {
            workspaceId: context.workspaceId,
            provider: data.provider,
            enabled: true,
            id: { not: String(id) },
          },
          data: {
            enabled: false,
          },
        })
      }

      const provider = await prisma.aiServiceProvider.update({
        ...query,
        where: { id: String(id) },
        data: {
          provider: data.provider,
          name: data.name,
          enabled: shouldEnable,
          baseUrl: data.baseUrl,
          // Only update apiKey if provided (preserve existing if undefined)
          ...(data.apiKey && { apiKey: encryptValue(data.apiKey) }),
          vramGb: data.vramGb,
          updatedBy: userId,
        },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(context.workspaceId)

      return provider
    },
  }),
)

// Toggle provider enabled/disabled
builder.mutationField('toggleAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      enabled: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _source, { id, enabled }, context) => {
      const userId = context.session.user.id

      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Provider not found or access denied')
      }

      // For non-Ollama providers, if enabling this provider, disable others of same type
      if (enabled && existing.provider !== 'ollama') {
        await prisma.aiServiceProvider.updateMany({
          where: {
            workspaceId: context.workspaceId,
            provider: existing.provider,
            enabled: true,
            id: { not: String(id) },
          },
          data: {
            enabled: false,
          },
        })
      }

      const provider = await prisma.aiServiceProvider.update({
        ...query,
        where: { id: String(id) },
        data: {
          enabled,
          updatedBy: userId,
        },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(context.workspaceId)

      return provider
    },
  }),
)

// Delete an AI service provider
builder.mutationField('deleteAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Provider not found or access denied')
      }

      // TODO: Check for dependencies (libraries, assistants using this provider)
      // For now, just delete (cascade will handle relations if any)

      await prisma.aiServiceProvider.delete({
        where: { id: String(id) },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(context.workspaceId)

      return true
    },
  }),
)

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
      const userId = context.session.user.id
      const workspaceId = context.workspaceId
      const providersToCreate: Array<{
        provider: string
        name: string
        baseUrl?: string
        apiKey?: string
        vramGb?: number
      }> = []

      // Import OpenAI if configured
      if (OPENAI_API_KEY) {
        providersToCreate.push({
          provider: 'openai',
          name: 'OpenAI',
          apiKey: OPENAI_API_KEY,
          baseUrl: OPENAI_BASE_URL,
        })
      }

      // Import all configured Ollama instances
      for (const instance of OLLAMA_INSTANCES) {
        providersToCreate.push({
          provider: 'ollama',
          name: instance.name,
          baseUrl: instance.baseUrl,
          apiKey: instance.apiKey,
          vramGb: instance.vramGb,
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
            provider: providerData.provider,
            name: providerData.name,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // For non-Ollama providers, disable others of same type before creating
        if (providerData.provider !== 'ollama') {
          await prisma.aiServiceProvider.updateMany({
            where: {
              workspaceId,
              provider: providerData.provider,
              enabled: true,
            },
            data: {
              enabled: false,
            },
          })
        }
        if (providerData.apiKey == undefined) {
          throw new Error('API key is required')
        }
        const encryptedApi = encryptValue(providerData.apiKey)

        // Create new provider (enabled by default)
        const newProvider = await prisma.aiServiceProvider.create({
          data: {
            workspaceId,
            provider: providerData.provider,
            name: providerData.name,
            enabled: true,
            baseUrl: providerData.baseUrl,
            apiKey: encryptedApi,
            vramGb: providerData.vramGb,
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

// Input type for testing provider connection
const TestProviderConnectionInput = builder.inputType('TestProviderConnectionInput', {
  fields: (t) => ({
    providerId: t.string({ required: false }), // If provided, use stored credentials as fallback
    provider: t.string({ required: true }),
    baseUrl: t.string({ required: false }),
    apiKey: t.string({ required: false }),
  }),
})

// Result type for connection test
const TestProviderConnectionResult = builder.objectRef<{
  success: boolean
  message: string
  details?: string
}>('TestProviderConnectionResult')

builder.objectType(TestProviderConnectionResult, {
  fields: (t) => ({
    success: t.field({
      type: 'Boolean',
      nullable: false,
      resolve: (parent) => parent.success,
    }),
    message: t.field({
      type: 'String',
      nullable: false,
      resolve: (parent) => parent.message,
    }),
    details: t.field({
      type: 'String',
      nullable: true,
      resolve: (parent) => parent.details,
    }),
  }),
})

// Test provider connection
builder.mutationField('testProviderConnection', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: TestProviderConnectionResult,
    nullable: false,
    args: {
      data: t.arg({ type: TestProviderConnectionInput, required: true }),
    },
    resolve: async (_source, { data }, context) => {
      try {
        // If providerId is given, fetch stored credentials to use as fallback
        let storedProvider = null
        if (data.providerId) {
          storedProvider = await prisma.aiServiceProvider.findFirst({
            where: {
              id: data.providerId,
              workspaceId: context.workspaceId,
            },
          })
        }

        // Use provided values, fall back to stored values if available
        const baseUrl = data.baseUrl || storedProvider?.baseUrl || undefined
        const apiKey = data.apiKey || storedProvider?.apiKey || undefined
        if (apiKey == undefined) {
          return {
            success: false,
            message: 'API key is required for OpenAI',
          }
        }

        if (data.provider === 'ollama') {
          // Test Ollama connection
          if (!baseUrl) {
            return {
              success: false,
              message: 'Base URL is required for Ollama connection test',
            }
          }

          const result = await testOllamaConnection({ url: baseUrl, apiKey: encryptValue(apiKey) })

          if (result.success) {
            return {
              success: true,
              message: `Successfully connected to Ollama at ${baseUrl}`,
            }
          } else {
            return {
              success: false,
              message: 'Failed to connect to Ollama',
              details: result.error,
            }
          }
        } else if (data.provider === 'openai') {
          // Test OpenAI connection
          const encryptedApiKey = encryptValue(apiKey)
          const result = await testOpenAIConnection({ apiKey: encryptedApiKey })

          if (result.success) {
            return {
              success: true,
              message: `Successfully connected to OpenAI`,
            }
          } else {
            return {
              success: false,
              message: 'Failed to connect to OpenAI',
              details: result.error,
            }
          }
        } else {
          return {
            success: false,
            message: `Provider type '${data.provider}' is not supported for connection testing`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return {
          success: false,
          message: 'Connection test failed',
          details: errorMessage,
        }
      }
    },
  }),
)
