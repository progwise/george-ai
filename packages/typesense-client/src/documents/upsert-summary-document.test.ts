import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { server } from '../mocks/server.js'
import { sampleDocument } from './search-summary-documents.test.js'
import { upsertSummaryDocument } from './upsert-summary-document.js'
import { rest } from 'msw'

// it('successfully upserts a document', async () => {
//   await expect(
//     upsertSummaryDocument(summaryCollectionSchema, sampleDocument),
//   ).resolves.not.toThrow()
// })

it('handles upsert failure', async () => {
  server.use(
    rest.post(
      `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/upsert`,
      (request, response, context) => {
        return response(
          context.status(500),
          context.json({ message: 'An error has occurred' }),
        )
      },
    ),
  )

  await expect(upsertSummaryDocument(sampleDocument)).rejects.toThrow()
})
