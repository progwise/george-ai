import { graphql } from 'msw'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'
import { server } from '../mocks/server'
import { createFeedback } from './create-feedback'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('creates feedback successfully', async () => {
  const feedback = await createFeedback(
    1,
    'query',
    Enum_Summaryfeedback_Voting.Up,
    '1',
  )
  expect(feedback?.attributes).toEqual({
    position: 1,
    query: 'query',
    voting: Enum_Summaryfeedback_Voting.Up,
    web_page_summary: {
      data: {
        id: '1',
      },
    },
  })
})

test('handles createFeedback failure', async () => {
  server.use(
    graphql.mutation('CreateSummaryFeedback', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(
    createFeedback(1, 'query', Enum_Summaryfeedback_Voting.Up, '1'),
  ).rejects.toThrow()
})
