import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { DocumentNode, ExecutionResult } from 'graphql'
import { createYoga } from 'graphql-yoga'

import { schema } from '..'

const yoga = createYoga({ schema })
const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
  endpoint: 'http://yoga/graphql',
})

export const executeGraphQL = async (query: DocumentNode, options?: { variables?: Record<string, unknown> }) => {
  const result = (await executor({
    document: query,
    ...options,
  })) as ExecutionResult

  return result
}

export { parse as graphql } from 'graphql'
