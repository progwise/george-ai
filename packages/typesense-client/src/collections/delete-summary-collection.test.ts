import { server } from '../mocks/server.js'
import { deleteSummaryCollection } from './delete-summary-collection.js'
import { summaryCollectionSchema } from './summary-collection-schema.js'

import { rest } from 'msw'

it('successfully deletes a collection', async () => {
  await expect(deleteSummaryCollection()).resolves.not.toThrow()
})

it('handles deletion failure', async () => {
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

  await expect(deleteSummaryCollection()).rejects.toThrow()
})
