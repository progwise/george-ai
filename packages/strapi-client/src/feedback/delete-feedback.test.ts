import { graphql } from 'msw'
import { server } from '../mocks/server'
import { deleteFeedback } from './delete-feedback'

it('deletes feedback successfully', async () => {
  await expect(deleteFeedback('1')).resolves.not.toThrow()
})

it('handles deleteFeedback failure', async () => {
  server.use(
    graphql.mutation('DeleteSummaryFeedback', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(deleteFeedback('1')).rejects.toThrow()
})
