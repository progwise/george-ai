import { graphql } from 'msw'
import { server } from '../mocks/server'
import { createSummary, NewSummary } from './create-summary'

const summaryData: NewSummary = {
  summary: 'test summary',
  keywords: 'test, keywords',
  largeLanguageModel: 'gpt-3.5-turbo',
  scraped_web_page: '1',
}

it('creates web page summary successfully', async () => {
  await expect(createSummary(summaryData, 'en')).resolves.not.toThrow()
})

it('handles summary creation failure', async () => {
  server.use(
    graphql.mutation('CreateWebPageSummary', (request, response, context) => {
      return response(context.errors([{ message: 'An error occurred' }]))
    }),
  )
  await expect(createSummary(summaryData, 'en')).rejects.toThrow()
})
