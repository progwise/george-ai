import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { modelProvider } from '@george-ai/event-service-client'
import { RequestTestConnection } from '@george-ai/event-service-client/src/model-provider/schema'

import { builder } from '../../builder'

// Test provider connection
builder.mutationField('testProviderConnection', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TestProviderConnectionResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
        isOnline: t.boolean({ nullable: true }),
        isHealthy: t.boolean({ nullable: true }),
        message: t.string({ nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      providerId: t.arg.string({ required: false }), // If provided, use stored credentials as fallback
      provider: t.arg({ type: 'ModelProvider', required: true }),
      baseUrl: t.arg.string({ required: false }),
      apiKey: t.arg.string({ required: false }),
    },
    resolve: async (_source, { providerId, provider, baseUrl, apiKey }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const request: RequestTestConnection = {
        version: 1,
        callType: 'testConnection',
        workspaceId,
        modelProvider: provider,
        providerId,
        connection: {
          version: 1,
          baseUrl,
          apiKey,
        },
      }

      if (!baseUrl && !apiKey && !providerId) {
        return {
          success: false,
          message: 'No connection details provided and no providerId for fallback',
        }
      }

      if (!baseUrl && !apiKey && providerId) {
        const storedProvider = await prisma.aiServiceProvider.findFirst({
          select: {
            apiKey: true,
            baseUrl: true,
          },
          where: {
            id: providerId,
            workspaceId,
          },
        })

        if (!storedProvider) {
          return {
            success: false,
            message: 'Provider not found for given providerId',
          }
        }

        request.connection = {
          version: 1,
          baseUrl: storedProvider.baseUrl || undefined,
          apiKey: storedProvider.apiKey || undefined,
        }
      }

      const testResult = await modelProvider.callProviderInstance(request)

      return {
        success: true,
        isOnline: testResult.isOnline,
        isHealthy: testResult.isHealthy,
        message: testResult.statusMessage || 'Connection test completed',
      }
    },
  }),
)
