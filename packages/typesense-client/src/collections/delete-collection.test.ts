import { server } from '../mocks/server.js'
import { summaryCollectionSchema } from './summary-collection-schema.js'
import { deleteCollection } from './delete-collection.js'
import { rest } from 'msw'

test('successfully deletes a collection', async () => {
  await expect(deleteCollection()).resolves.not.toThrow()
})

test('handles deletion failure', async () => {
  server.use(
    rest.delete(
      `https://localhost:8108/collections/${summaryCollectionSchema.name}`,
      (request, response, context) => {
        return response(
          context.status(500),
          context.json({ message: 'An error has occurred' }),
        )
      },
    ),
  )

  await expect(deleteCollection()).rejects.toThrow()
})
