import { registerUrql } from '@urql/next/rsc'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3000/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

export const { getClient } = registerUrql(makeClient)
