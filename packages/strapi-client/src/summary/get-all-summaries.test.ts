import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getAllSummaries } from '..'

it('fetches all summaries successfully', async () => {
  const summaries = await getAllSummaries()

  expect(summaries).toEqual([
    {
      id: '1',
      language: 'en',
      keywords: ['keyword1', 'keyword2'],
      summary: 'summary',
      largeLanguageModel: 'gpt-3.5-turbo',
      publishedAt: '2023-11-01T00:00:00Z',
      feedbacks: ['up'],
      title: 'test-title',
      url: 'http://test.com',
      originalContent: 'originalContent',
    },
  ])
})

it('handles failure in fetching all summaries', async () => {
  server.use(
    graphql.query('GetWebPageSummaries', (request, response, context) => {
      return response(context.errors([{ message: 'An error occurred' }]))
    }),
  )

  await expect(getAllSummaries()).rejects.toThrow()
})
