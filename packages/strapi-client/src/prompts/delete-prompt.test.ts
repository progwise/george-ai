import { graphql } from 'msw'
import { server } from '../mocks/server'
import { deletePrompt } from './delete-prompt'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('deletes prompt successfully', async () => {
  await expect(deletePrompt('1')).resolves.not.toThrow()
})

it('handles deletePrompt failure', async () => {
  server.use(
    graphql.mutation('DeletePrompt', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )
  await expect(deletePrompt('1')).rejects.toThrow()
})
