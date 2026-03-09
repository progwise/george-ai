import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceHostConnectionSchema } from '@george-ai/app-schema'
import { ConnectionTestRequest, invokeAction } from '@george-ai/event-service-client'

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
      driver: t.arg({ type: 'InferenceDriver', required: true }),
      baseUrl: t.arg.string({ required: false }),
      apiKey: t.arg.string({ required: false }),
    },
    resolve: async (_source, { providerId, driver, baseUrl, apiKey }, { workspaceId, session }) => {
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

      const request: ConnectionTestRequest = {
        version: 1,
        action: 'connectionTest',
        workspaceId,
        connection: InferenceHostConnectionSchema.parse({
          driver,
          baseUrl: !baseUrl ? storedBaseUrl : baseUrl,
          encryptedApiKey: !encryptedApiKey ? storedEncryptedApiKey : encryptedApiKey,
        }),
        verb: 'request',
        timestamp: new Date(),
      }

      logger.debug('test provider connection mutation', { args: { providerId, driver, baseUrl, apiKey }, request })

      // TODO: Check for alternative so we do not send apiKey
      const testResult = await invokeAction(request)

      return {
        success: testResult.success,
        isOnline: testResult.isOnline,
        isHealthy: testResult.isHealthy,
        message: testResult.statusMessage || 'Connection test completed',
      }
    },
  }),
)
