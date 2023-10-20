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
]
