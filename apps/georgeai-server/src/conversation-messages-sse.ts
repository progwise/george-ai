import {
  subscribeConversationMessagesUpdate,
  unsubscribeConversationMessagesUpdates,
} from '@george-ai/pothos-graphql/src/conversation-messages-subscription'
import { Request, Response } from 'express'

const eventIds = new Map<string, number>()

export const conversationMessagesSSE = async (
  request: Request,
  response: Response,
) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'access-control-allow-origin': '*',
    Connection: 'keep-alive',
  })

  const conversationId = request.query['conversationId'] as string
  console.log('SSE connection opened', conversationId)
  const conversationMessagesUpdateSubscriptionId =
    subscribeConversationMessagesUpdate(
      conversationId,
      ({
        messageId,
        sequenceNumber,
        content,
        createdAt,
        updatedAt,
        sender,
      }) => {
        const id = eventIds.get(conversationId) || 0
        eventIds.set(conversationId, id + 1)

        response.write(`id: ${id}\n`)
        response.write('event: message\n')
        response.write(
          `data: ${JSON.stringify({ id: messageId, sequenceNumber: sequenceNumber.toString(), content, createdAt, updatedAt, sender })}\n\n`,
        )
      },
    )

  request.on('close', () => {
    console.log('SSE connection closed by client', conversationId)
    console.log('Cancel Subscription', conversationMessagesUpdateSubscriptionId)
    unsubscribeConversationMessagesUpdates(
      conversationMessagesUpdateSubscriptionId,
    )
    response.end()
  })
}
