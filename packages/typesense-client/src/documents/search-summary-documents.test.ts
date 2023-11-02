// packages/typesense-client/src/documents/search-web-page-documents.test.ts
import { server } from '../mocks/server.js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import {
  PublicationState,
  searchSummaryDocuments,
} from './search-summary-documents.js'
import { rest } from 'msw'

export const sampleDocument = {
  id: '1',
  language: 'en',
  keywords: ['sample'],
  summary: 'Sample Summary',
  largeLanguageModel: 'Sample Model',
  title: 'Sample Title',
  url: 'http://example.com',
  originalContent: 'Sample Content',
  publicationState: PublicationState.Draft,
  popularity: 0,
}

// it('successfully searches for documents', async () => {
//   server.use(
//     rest.post(
//       `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/search`,
//       (request, response, context) => {
//         return response(
//           context.status(200),
//           context.json({ hits: [{ document: sampleDocument }] }),
//         )
//       },
//     ),
//   )

//   const result = await searchSummaryDocuments('sample query', '["publicationState:published"]')
//   expect(result).toEqual([sampleDocument])
// })

it('handles search failure', async () => {
  server.use(
    rest.post(
      `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/search`,
      (request, response, context) => {
        return response(
          context.status(500),
          context.json({ message: 'An error has occurred' }),
        )
      },
    ),
  )

  await expect(
    searchSummaryDocuments('sample query', '["publicationState:published"]'),
  ).rejects.toThrow()
})
