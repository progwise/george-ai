import { graphql } from 'msw'
import { server } from '../mocks/server'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'
import { getSummaryId } from './get-summary-id'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('fetches summary ID successfully', async () => {
  const id = await getSummaryId('gpt-3.5-turbo', 'https://example.com', 'en')
  expect(id).toEqual('1')
})

test('handles failure in fetching summary ID', async () => {
  server.use(
    graphql.query(
      'GetWebPageSummariesByLanguageModelAndUrl',
      (request, response, context) => {
        return response(context.errors([{ message: 'An error occurred' }]))
      },
    ),
  )

  await expect(
    getSummaryId('gpt-3.5-turbo', 'https://example.com', 'en'),
  ).rejects.toThrow()
})
