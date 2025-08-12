import { Request, Response } from 'express'

import {
  subscribeEnrichmentQueueUpdates,
  unsubscribeEnrichmentQueueUpdates,
} from '@george-ai/pothos-graphql/src/enrichment-queue-subscription'
import { prisma } from '@george-ai/pothos-graphql/src/prisma'

import { getUserContext } from './getUserContext'

const eventIds = new Map<string, number>()

export const enrichmentQueueSSE = async (request: Request, response: Response) => {
  if (!request.query['listId']) {
    response.status(400).send('listId is required')
    return
  }

  // Authentication check using existing getUserContext
  const getToken = () => {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.replace('Bearer ', '')
  }

  const context = await getUserContext(getToken)
  if (!context.session?.user) {
    response.status(401).send('Unauthorized: Authentication required')
    return
  }

  const user = context.session.user

  const listId = request.query['listId'] as string

  // Authorization check - verify user has access to the list
  try {
    const list = await prisma.aiList.findFirst({
      where: { id: listId },
      include: { participants: true },
    })

    if (!list) {
      response.status(404).send('List not found')
      return
    }

    const hasAccess = list.ownerId === user.id || list.participants.some((p) => p.userId === user.id)

    if (!hasAccess) {
      response.status(403).send('Forbidden: Access denied to list')
      return
    }
  } catch (error) {
    console.error('SSE authorization error:', error)
    response.status(500).send('Internal server error')
    return
  }

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'access-control-allow-origin': '*',
    Connection: 'keep-alive',
  })

  console.log('Enrichment queue SSE connection opened', listId, 'for user', user.id)

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
