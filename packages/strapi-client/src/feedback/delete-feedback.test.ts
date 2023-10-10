import { graphql } from 'msw'
import { server } from '../mocks/server'
import { deleteFeedback } from './delete-feedback'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('deletes feedback successfully', async () => {
  await expect(deleteFeedback('1')).resolves.not.toThrow()
})

test('handles deleteFeedback failure', async () => {
  server.use(
    graphql.mutation('DeleteSummaryFeedback', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(deleteFeedback('1')).rejects.toThrow()
})
