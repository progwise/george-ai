/// <reference types="vite/types/importMeta.d.ts" />
import 'dotenv/config'
import { createYoga } from 'graphql-yoga'
import express from 'express'
import { schema } from '@george-ai/pothos-graphql'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/',
})

const yogaRouter = express.Router()
yogaRouter.use(yoga)

const app = express()

app.use((req, res, next) => {
  const authHeader = req.headers.authorization
  console.log('authHeader', authHeader)
  console.log('req.method', req.method)
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

if (!import.meta.env.DEV) {
  app.listen(3003, () => {
    console.log('Express graphql server on 3003')
  })
}

export const viteNodeApp = app
