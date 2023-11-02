import { graphql } from 'msw'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'
import { server } from '../mocks/server'
import { createFeedback } from './create-feedback'

it('creates feedback successfully', async () => {
  const feedback = await createFeedback(
    1,
    'query',
    Enum_Summaryfeedback_Voting.Up,
    '1',
  )
  expect(feedback).toEqual('1')
})

it('handles createFeedback failure', async () => {
  server.use(
    graphql.mutation('CreateSummaryFeedback', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(
    createFeedback(1, 'query', Enum_Summaryfeedback_Voting.Up, '1'),
  ).rejects.toThrow()
})
