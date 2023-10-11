import { graphql } from 'msw'
import { server } from '../mocks/server'
import { createPrompt } from './create-prompt'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('creates prompt successfully', async () => {
  await expect(
    createPrompt('en', ['summary1', 'summary2'], ['keyword1', 'keyword2']),
  ).resolves.not.toThrow()
})

it('handles createPrompt failure', async () => {
  server.use(
    graphql.mutation('CreatePrompt', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(
    createPrompt('en', ['summary1', 'summary2'], ['keyword1', 'keyword2']),
  ).rejects.toThrow()
})
