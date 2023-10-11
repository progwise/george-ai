import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getDefaultPromptIds } from './get-default-prompt-ids'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('fetches default prompt IDs successfully', async () => {
  const ids = await getDefaultPromptIds()
  expect(ids).toEqual(['1', '2'])
})

it('handles getDefaultPromptIds failure', async () => {
  server.use(
    graphql.query('GetDefaultPrompts', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(getDefaultPromptIds()).rejects.toThrow()
})
