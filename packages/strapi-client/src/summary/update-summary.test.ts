import { graphql } from 'msw'
import { server } from '../mocks/server'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'
import { updateSummary } from './update-summary'
import { NewSummary } from './create-summary'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const updateData: NewSummary = {
  summary: 'updated summary',
  keywords: 'updated, keywords',
  largeLanguageModel: 'gpt-3.5-turbo',
  scraped_web_page: '1',
}

test('updates web page summary successfully', async () => {
  await expect(updateSummary(updateData, '1')).resolves.not.toThrow()
})

test('handles failure in updating summary', async () => {
  server.use(
    graphql.mutation('UpdateWebPageSummary', (request, response, context) => {
      return response(context.errors([{ message: 'An error occurred' }]))
    }),
  )
  await expect(updateSummary(updateData, '1')).rejects.toThrow()
})
