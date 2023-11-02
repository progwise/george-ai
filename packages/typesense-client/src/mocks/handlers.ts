import { RestHandler, rest } from 'msw'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'

export const handlers: RestHandler[] = [
  rest.delete(
    `https://localhost:8108/collections/${summaryCollectionSchema.name}`,
    (request, response, context) => {
      const { collectionName } = request.params
      return response(context.status(200))
    },
  ),
  rest.get(
    `https://localhost:8108/collections/${summaryCollectionSchema.name}`,
    (request, response, context) => {
      return response(context.status(200))
    },
  ),
  rest.delete(
    `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/:id`,
    (request, response, context) => {
      const { id } = request.params
      return response(context.status(200))
    },
  ),
  rest.post(
    `https://localhost:8108/collections/${summaryCollectionSchema.name}documents/upsert`,
    (request, response, context) => {
      return response(context.status(200))
    },
  ),
  rest.post(
    `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/search`,
    (request, response, context) => {
      return response(context.status(200), context.json({ hits: [] }))
    },
  ),
]
