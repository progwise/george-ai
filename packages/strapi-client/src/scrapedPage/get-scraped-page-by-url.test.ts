import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('fetches scraped web page by URL successfully', async () => {
  const scrapedPage = await getScrapedPageByUrl('https://example.com')

  expect(scrapedPage).toEqual({ id: '1' })
})

it('handles fetch failure', async () => {
  server.use(
    graphql.query('GetScrapedWebPagesByUrl', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(getScrapedPageByUrl('https://example.com')).rejects.toThrow()
})
