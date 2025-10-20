import 'dotenv/config'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { createYoga } from 'graphql-yoga'

import { schema } from '@george-ai/pothos-graphql'
// Import and start workers
import { startContentProcessingWorker, startEnrichmentQueueWorker } from '@george-ai/pothos-graphql'

import { assistantIconMiddleware } from './assistantIconMiddleware'
import { avatarMiddleware } from './avatarMiddleware'
import { conversationMessagesSSE } from './conversation-messages-sse'
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

// Start workers
if (process.env.AUTOSTART_ENRICHMENT_WORKER === 'true') {
  console.log('Auto-starting enrichment queue worker...')
  startEnrichmentQueueWorker().catch(console.error)
}
if (process.env.AUTOSTART_CONTENT_PROCESSING_WORKER === 'true') {
  console.log('Auto-starting content processing worker...')
  startContentProcessingWorker().catch(console.error)
}
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) =>
    getUserContext(() => {
      const jwtTokenHeader = request.headers.get('x-user-jwt')
      const keycloakToken = request.headers
        .get('cookie')
        ?.split(';')
        .find((c) => c.trim().startsWith('keycloak-token='))
        ?.split('=')[1]
      const authHeader = request.headers.get('authorization')

      return {
        jwtToken: jwtTokenHeader || keycloakToken,
        bearerToken: authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null,
      }
    }),
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

// Only check API key or user JWT for /graphql POST requests
app.use('/graphql', (req, res, next) => {
  // Only enforce authentication for POST requests to /graphql
  if (req.method.toUpperCase() === 'POST') {
    const apiKey = req.headers['x-api-key']
    const authorization = req.headers['authorization']
    const userJwt = req.headers['x-user-jwt']
    const devUser = req.headers['x-dev-user']

    // Global API key is valid if it matches the configured value
    const globalApiKeyValid =
      apiKey === process.env.GRAPHQL_API_KEY || authorization === `ApiKey ${process.env.GRAPHQL_API_KEY}`

    // Library-scoped API key (Bearer token) - will be validated in getUserContext
    const hasBearerToken = authorization?.startsWith('Bearer ')

    // In development, allow requests with x-dev-user header for testing
    const devUserAllowed = process.env.NODE_ENV !== 'production' && typeof devUser === 'string' && devUser.length > 0

    // Allow if global API key is valid, or user JWT is present, or Bearer token is present, or dev user in dev mode
    if (!globalApiKeyValid && !userJwt && !hasBearerToken && !devUserAllowed) {
      res.status(401).send('Unauthorized')
      return
    }
  }
  next()
})

app.use('/graphql', yoga)

const server = app.listen(3003, '0.0.0.0', () => {
  console.log('Express graphql server on http://0.0.0.0:3003 or http://localhost:3003')
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Error: Port 3003 is already in use')
    console.error('Please stop the other process or change the PORT environment variable')
  } else if (error.code === 'EACCES') {
    console.error('❌ Error: Permission denied to bind to port 3003')
    console.error('Try using a port number above 1024 or run with appropriate permissions')
  } else {
    console.error('❌ Server error:', error.message)
  }
  process.exit(1)
})

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`)

  // Close server first to stop accepting new connections
  server.close(() => {
    console.log('Server closed successfully')
    process.exit(0)
  })

  // Force close after 5 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGHUP', () => shutdown('SIGHUP'))
