/// <reference types="vite/types/importMeta.d.ts" />
import 'dotenv/config'
import { createYoga } from 'graphql-yoga'
import express from 'express'
import { schema } from '@george-ai/pothos-graphql'
import { dataUploadMiddleware } from './upload'
import { conversationMessagesSSE } from './conversation-messages-sse'
import cors from 'cors'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
})

const yogaRouter = express.Router({})
yogaRouter.use(yoga)

const app = express()

app.use(cors())

app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*')

  const authHeader = req.headers.authorization
  if (
    req.method.toUpperCase() === 'POST' &&
    authHeader !== `ApiKey ${process.env.GRAPHQL_API_KEY}`
  ) {
    res.status(401).send('Unauthorized')
    return
  }
  next()
})

app.use(yoga.graphqlEndpoint, yogaRouter)
app.use('/upload', dataUploadMiddleware)
app.get('/conversation-messages-sse', conversationMessagesSSE)

if (!import.meta.env.DEV) {
  app.listen(3003, () => {
    console.log('Express graphql server on 3003')
  })
}

export const viteNodeApp = app
