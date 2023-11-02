import { server } from '../mocks/server.js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { deleteSummaryDocument } from './delete-summary-document.js'
import { rest } from 'msw'

it('successfully deletes a document', async () => {
  const id = '1'
  await expect(deleteSummaryDocument(id)).resolves.not.toThrow()
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

  await expect(deleteSummaryDocument(id)).rejects.toThrow()
})
