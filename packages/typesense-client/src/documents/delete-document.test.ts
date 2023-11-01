import { server } from '../mocks/server.js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { deleteDocument } from './delete-document.js'
import { rest } from 'msw'

it('successfully deletes a document', async () => {
  const id = '1'
  await expect(deleteDocument(id)).resolves.not.toThrow()
})

it('handles document deletion failure', async () => {
  const id = '1'
  server.use(
    rest.delete(
      `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/${id}`,
      (request, response, context) => {
        return response(
          context.status(500),
          context.json({ message: 'An error has occurred' }),
        )
      },
    ),
  )

  await expect(deleteDocument(id)).rejects.toThrow()
})
