import { Request, Response } from 'express'

import {
  subscribeEnrichmentQueueUpdates,
  unsubscribeEnrichmentQueueUpdates,
} from '@george-ai/pothos-graphql/src/enrichment-queue-subscription'
import { prisma } from '@george-ai/pothos-graphql/src/prisma'

import { getUserContext } from './getUserContext'

const eventIds = new Map<string, number>()

export const enrichmentQueueSSE = async (request: Request, response: Response) => {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': request.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Cache-Control',
    })
    response.end()
    return
  }

  if (!request.query['listId']) {
    response.status(400).send('listId is required')
    return
  }

  // Authentication check using existing getUserContext
  const getToken = () => {
    // For SSE, check cookies since EventSource automatically sends them
    // This matches how the GraphQL endpoint gets the token
    const cookies = request.headers.cookie
    if (cookies) {
      // Parse the keycloak token cookie (matches backend.ts pattern)
      const tokenMatch = cookies.match(/keycloak-token=([^;]+)/)
      if (tokenMatch) {
        return decodeURIComponent(tokenMatch[1])
      }
    }

    // Fallback to Authorization header for other clients
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '')
    }

    return null
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
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': request.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Cache-Control',
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
