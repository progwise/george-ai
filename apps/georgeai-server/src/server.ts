/// <reference types="vite/types/importMeta.d.ts" />
import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import { createYoga } from 'graphql-yoga'

import { schema } from '@george-ai/pothos-graphql'

import { assistantIconMiddleware } from './assistantIconMiddleware'
import { authorizeGraphQlRequest } from './authorizeGraphQlRequest'
import { conversationMessagesSSE } from './conversation-messages-sse'
import { dataUploadMiddleware } from './upload'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) => authorizeGraphQlRequest(request),
})

const app = express()

app.use(cors())
app.use('/assistant-icon', assistantIconMiddleware)
app.use('/upload', dataUploadMiddleware)
app.get('/conversation-messages-sse', conversationMessagesSSE)

// Only check API key or user JWT for /graphql POST requests
app.use('/graphql', (req, res, next) => {
  // Only enforce authentication for POST requests to /graphql
  if (req.method.toUpperCase() === 'POST') {
    const apiKey = req.headers['x-api-key']
    const authorization = req.headers['authorization']
    const userJwt = req.headers['x-user-jwt']
    const devUser = req.headers['x-dev-user']

    // API key is valid if it matches the configured value (either via x-api-key or Authorization header)
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
