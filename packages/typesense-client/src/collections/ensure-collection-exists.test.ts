import { server } from '../mocks/server.js'
import { summaryCollectionSchema } from './summary-collection-schema.js'
import { rest } from 'msw'
import { ensureCollectionExists } from './ensure-collection-exists.js'

test('successfully get a collection', async () => {
  await expect(ensureCollectionExists()).resolves.not.toThrow()
})

test('successfully create a collection', async () => {
  let collectionCreated = false
  server.use(
    rest.get(
      `https://localhost:8108/collections/${summaryCollectionSchema.name}`,
      (request, response, context) => {
        return response(context.status(404))
      },
    ),
    rest.post(
      `https://localhost:8108/collections`,
      async (request, response, context) => {
        collectionCreated = true
        return response(context.status(200))
      },
    ),
  )
  await expect(ensureCollectionExists()).resolves.not.toThrow()
  expect(collectionCreated).toBeTruthy()
})
