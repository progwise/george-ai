import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getScraperConfigurations } from './get-scraper-configurations'

it('fetches scraper configuration successfully', async () => {
  const configuration = await getScraperConfigurations()

  expect(configuration).toEqual([
    {
      startUrl: 'http://example.com',
      depth: 2,
      prompts: ['1'],
    },
  ])
})

it('handles failure', async () => {
  server.use(
    graphql.query('GetScraperConfiguration', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )

  await expect(getScraperConfigurations()).rejects.toThrow()
})
