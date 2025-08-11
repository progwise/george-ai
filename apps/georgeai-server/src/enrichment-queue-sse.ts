import { Request, Response } from 'express'

import {
  subscribeEnrichmentQueueUpdates,
  unsubscribeEnrichmentQueueUpdates,
} from '@george-ai/pothos-graphql/src/enrichment-queue-subscription'

const eventIds = new Map<string, number>()

export const enrichmentQueueSSE = async (request: Request, response: Response) => {
  if (!request.query['listId']) {
    response.status(400).send('listId is required')
    return
  }

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'access-control-allow-origin': '*',
    Connection: 'keep-alive',
  })

  const listId = request.query['listId'] as string
  console.log('Enrichment queue SSE connection opened', listId)

  const subscriptionId = subscribeEnrichmentQueueUpdates(listId, (update) => {
    const id = eventIds.get(listId) || 0
    eventIds.set(listId, id + 1)

    response.write(`id: ${id}\n`)
    response.write('event: enrichment-update\n')
    response.write(`data: ${JSON.stringify(update)}\n\n`)
  })

  // Send initial connection confirmation
  response.write(`id: 0\n`)
  response.write('event: connected\n')
  response.write(`data: ${JSON.stringify({ listId, subscriptionId })}\n\n`)

  request.on('close', () => {
    console.log('Enrichment queue SSE connection closed by client', listId)
    console.log('Cancel enrichment queue subscription', subscriptionId)
    unsubscribeEnrichmentQueueUpdates({
      listId,
      subscriptionId,
    })
    response.end()
  })

  request.on('error', (error) => {
    console.error('Enrichment queue SSE connection error:', error)
    unsubscribeEnrichmentQueueUpdates({
      listId,
      subscriptionId,
    })
    response.end()
  })
}
