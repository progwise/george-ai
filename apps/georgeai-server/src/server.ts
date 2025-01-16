/// <reference types="vite/types/importMeta.d.ts" />
import 'dotenv/config'
import { createYoga } from 'graphql-yoga'
import express from 'express'
import { schema } from '@george-ai/pothos-graphql'

console.log('app starting...')

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/',
})

const yogaRouter = express.Router()
yogaRouter.use(yoga)

const app = express()
app.use(yoga.graphqlEndpoint, yogaRouter)

if (!import.meta.env.DEV) {
  app.listen(3003, () => {
    console.log('Express graphql server on 4000')
  })
}

export const viteNodeApp = app
