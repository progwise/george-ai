import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getScraperConfiguration } from './get-scraper-configuration'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('fetches scraper configuration successfully', async () => {
  const configuration = await getScraperConfiguration()

  expect(configuration).toEqual([
    {
      startUrl: 'http://example.com',
      depth: 2,
      prompts: [
        {
          summaryPrompt: 'summary',
          keywordPrompt: 'keywords',
          llm: 'gpt-3.5-turbo',
          locale: 'en',
        },
      ],
    },
  ])
})

test('handles failure', async () => {
  server.use(
    graphql.query('GetScraperConfiguration', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )

  await expect(getScraperConfiguration()).rejects.toThrow()
})
