import { graphql } from 'msw'
import { server } from '../mocks/server'
import { createScrapedPage } from './create-scraped-page'

it('creates scraped web page successfully', async () => {
  await expect(
    createScrapedPage('title', 'content', 'https://example.com', ['1']),
  ).resolves.not.toThrow()
})

it('handles creation failure', async () => {
  server.use(
    graphql.mutation('CreateScrapedWebPage', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(
    createScrapedPage('title', 'content', 'https://example.com', ['1']),
  ).rejects.toThrow()
})
