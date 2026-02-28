import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { ProviderTestConnectionRequest, requestProviderInstance } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

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

      if (!baseUrl && !apiKey && !providerId) {
        return {
          success: false,
          message: 'No connection details provided and no providerId for fallback',
        }
      }
      const { baseUrl: storedBaseUrl, apiKey: storedEncryptedApiKey } = !providerId
        ? { baseUrl: undefined, apiKey: undefined }
        : await prisma.aiServiceProvider.findFirstOrThrow({
            select: {
              apiKey: true,
              baseUrl: true,
            },
            where: {
              id: providerId,
              workspaceId,
            },
          })

      if (!baseUrl && !storedBaseUrl) {
        return { success: false, message: 'No url for provider available' }
      }

      const encryptedApiKey = apiKey ? encryptValue(apiKey) : null

      const request: ProviderTestConnectionRequest = {
        version: 1,
        requestType: 'testConnection',
        workspaceId,
        modelProvider: provider,
        connection: {
          baseUrl: !baseUrl ? storedBaseUrl : baseUrl,
          encryptedApiKey: !encryptedApiKey ? storedEncryptedApiKey : encryptedApiKey,
        },
      }

      logger.debug('test provider connection mutation', { args: { providerId, provider, baseUrl, apiKey }, request })

      // TODO: Check for alternative so we do not send apiKey
      const testResult = await requestProviderInstance(request)

      return {
        success: true,
        isOnline: testResult.isOnline,
        isHealthy: testResult.isHealthy,
        message: testResult.statusMessage || 'Connection test completed',
      }
    },
  }),
)
