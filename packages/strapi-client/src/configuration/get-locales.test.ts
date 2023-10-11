import { graphql } from 'msw'
import { server } from '../mocks/server'
import { getStrapiLocales } from './get-locales'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('fetches locales successfully', async () => {
  const locales = await getStrapiLocales()
  expect(locales).toEqual(['en', 'de'])
})

it('handles failure', async () => {
  server.use(
    graphql.query('GetAllLocales', (request, response, context) => {
      return response(context.errors([{ message: 'An error has occurred' }]))
    }),
  )

  await expect(getStrapiLocales()).rejects.toThrow()
})
