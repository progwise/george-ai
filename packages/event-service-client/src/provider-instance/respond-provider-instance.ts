import { eventClient } from '../client'
import { getRequestSubject, logger } from './common'
import { ProviderRequest, ProviderRequestSchema, ProviderResponse } from './schema'

export const respondProviderInstance = async <T extends ProviderRequest>(parameters: {
  request?: T
  handler: ({ event }: { event: T }) => Promise<ProviderResponse>
}) => {
  const { request, handler } = parameters
  const cleanup = await eventClient.respond({
    subject: getRequestSubject({
      workspaceId: request?.workspaceId,
      modelProvider: request?.connection.modelProvider,
      requestType: request?.requestType,
    }),
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const parsed = JSON.parse(decoded)
        const event = ProviderRequestSchema.parse(parsed) as T
        const response = await handler({ event })
        return new TextEncoder().encode(JSON.stringify(response))
      } catch (error) {
        logger.error('Error handling provider instance request:', { error, request })
        throw error
      }
    },
  })
  return async () => {
    await cleanup()
  }
}
