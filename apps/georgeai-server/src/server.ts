/// <reference types="vite/types/importMeta.d.ts" />
import 'dotenv/config'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { createYoga } from 'graphql-yoga'

import { schema } from '@george-ai/pothos-graphql'
// Import and start enrichment queue worker
import { startEnrichmentQueueWorker } from '@george-ai/pothos-graphql'

import { assistantIconMiddleware } from './assistantIconMiddleware'
import { avatarMiddleware } from './avatarMiddleware'
import { conversationMessagesSSE } from './conversation-messages-sse'
import { enrichmentQueueSSE } from './enrichment-queue-sse'
import { getUserContext } from './getUserContext'
import { libraryFiles } from './library-files'
import { dataUploadMiddleware } from './upload'

console.log('Starting GeorgeAI GraphQL server...')
console.log(`
  Environment: ${process.env.NODE_ENV || 'development'}
  GraphQL API Key: ${process.env.GRAPHQL_API_KEY ? '******' : 'not set'}
  GraphQL Endpoint: ${process.env.GRAPHQL_ENDPOINT || '/graphql'}
  Server Port: ${process.env.PORT || 3003}
  Assistant Icon Path: ${process.env.ASSISTANT_ICON_PATH || '/assistant-icon'}
  Avatar Path: ${process.env.AVATAR_PATH || '/avatar'}
  Data Upload Path: ${process.env.DATA_UPLOAD_PATH || '/upload'}
  OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL || 'not set'}
  `)

// Start the enrichment queue worker
startEnrichmentQueueWorker().catch(console.error)

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) => getUserContext(() => request.headers.get('x-user-jwt')),
})

const app = express()

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
)
app.use(cookieParser())
app.use('/assistant-icon', assistantIconMiddleware)
app.use('/avatar', avatarMiddleware)
app.use('/upload', dataUploadMiddleware)
app.get('/library-files/:libraryId/:fileId', libraryFiles)
app.get('/conversation-messages-sse', conversationMessagesSSE)
app.get('/enrichment-queue-sse', enrichmentQueueSSE)
app.options('/enrichment-queue-sse', enrichmentQueueSSE)

// Only check API key or user JWT for /graphql POST requests
app.use('/graphql', (req, res, next) => {
  // Only enforce authentication for POST requests to /graphql
  if (req.method.toUpperCase() === 'POST') {
    const apiKey = req.headers['x-api-key']
    const authorization = req.headers['authorization']
    const userJwt = req.headers['x-user-jwt']
    const devUser = req.headers['x-dev-user']

    // API key is valid if it matches the configured value (Authorization header)
    const apiKeyValid =
      apiKey === process.env.GRAPHQL_API_KEY || authorization === `ApiKey ${process.env.GRAPHQL_API_KEY}`

    // In development, allow requests with x-dev-user header for testing
    const devUserAllowed = process.env.NODE_ENV !== 'production' && typeof devUser === 'string' && devUser.length > 0

    // Allow if API key is valid, or user JWT is present, or dev user in dev mode
    if (!apiKeyValid && !userJwt && !devUserAllowed) {
      res.status(401).send('Unauthorized')
      return
    }
  }
  next()
})

app.use('/graphql', yoga)

if (!import.meta.env.DEV) {
  app.listen(3003, () => {
    console.log('Express graphql server on 3003')
  })
}

export const viteNodeApp = app
