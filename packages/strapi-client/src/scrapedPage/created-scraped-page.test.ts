import { graphql } from 'msw'
import { server } from '../mocks/server'
import { createdScrapedPage } from './created-scraped-page'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('creates scraped web page successfully', async () => {
  await expect(
    createdScrapedPage('title', 'content', 'https://example.com'),
  ).resolves.not.toThrow()
})

test('handles creation failure', async () => {
  server.use(
    graphql.mutation('CreateScrapedWebPage', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(
    createdScrapedPage('title', 'content', 'https://example.com'),
  ).rejects.toThrow()
})
