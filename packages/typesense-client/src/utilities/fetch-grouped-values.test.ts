import { server } from '../mocks/server.js'
import { fetchGroupedValues } from './fetch-grouped-values.js'
import { rest } from 'msw'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'

describe('fetchGroupedValues', () => {
  // it('fetches grouped values successfully', async () => {
  //   const fieldName = 'someField'
  //   const expectedGroupKeys = ['group1', 'group2']

  //   server.use(
  //     rest.post(
  //       `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/search`,
  //       async (request, response, context) => {
  //         const requestBody = await request.json()
  //         if (requestBody?.group_by === fieldName) {
  //           return response(
  //             context.status(200),
  //             context.json({
  //               grouped_hits: [
  //                 { group_key: 'group1' },
  //                 { group_key: 'group2' },
  //               ],
  //             }),
  //           )
  //         }
  //         return response(context.status(400))
  //       },
  //     ),
  //   )

  //   const result = await fetchGroupedValues(fieldName)
  //   expect(result).toEqual(expectedGroupKeys)
  // })

  it('throws an error on failure', async () => {
    server.use(
      rest.post(
        `https://localhost:8108/collections/${summaryCollectionSchema.name}/documents/search`,
        (request, response, context) => {
          return response(context.status(500))
        },
      ),
    )

    await expect(fetchGroupedValues('someField')).rejects.toThrow()
  })
})
