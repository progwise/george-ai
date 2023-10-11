import { graphql } from 'msw'
import { server } from '../mocks/server'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import { GetAllSummaries } from '..'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('fetches all summaries successfully', async () => {
  const summaries = await GetAllSummaries()
  expect(summaries).toEqual([
    {
      id: '1',
      attributes: {
        updatedAt: '2023-12-01T00:00:00Z',
        locale: 'en',
        keywords: ['keyword1', 'keyword2'],
        summary: 'summary',
        largeLanguageModel: 'gpt-3.5-turbo',
        publishedAt: '2023-11-01T00:00:00Z',
        summary_feedbacks: {
          data: [
            {
              attributes: {
                createdAt: '2023-11-02T00:00:00Z',
                voting: Enum_Summaryfeedback_Voting.Up,
              },
            },
          ],
        },
        scraped_web_page: {
          data: {
            attributes: {
              title: 'test-title',
              url: 'http://test.com',
              originalContent: 'originalContent',
            },
          },
        },
      },
    },
  ])
})

it('handles failure in fetching all summaries', async () => {
  server.use(
    graphql.query('GetWebPageSummaries', (request, response, context) => {
      return response(context.errors([{ message: 'An error occurred' }]))
    }),
  )

  await expect(GetAllSummaries()).rejects.toThrow()
})
