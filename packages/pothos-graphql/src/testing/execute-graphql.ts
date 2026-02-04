import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { DocumentNode, ExecutionResult } from 'graphql'
import { createYoga } from 'graphql-yoga'

import { schema } from '..'

const yoga = createYoga({
  schema,
  context: () => ({ ...context }),
  maskedErrors: {
    isDev: false,
    maskError: (error, message) => {
      if (error instanceof Error) {
        return error
      }
      return new Error(message)
    },
  }, // Set to true in production to avoid leaking error details })
})
const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
  endpoint: 'http://yoga/graphql',
})

export interface TestContext {
  session: {
    user: TestUser
    userProfile?: unknown
  }
  jwt?: string
  workspaceId?: string
  workspaceRole?: 'admin' | 'member' | 'viewer'
}

export interface TestUser {
  id: string
  username: string
  email: string
  defaultWorkspaceId: string
  isAdmin: boolean
}

let context: TestContext = {
  session: {
    user: {
      id: 'test-user-default-id',
      username: 'test-user-default-username',
      email: 'test-user-default-email@test.de',
      isAdmin: false,
      defaultWorkspaceId: 'test-workspace-default-id',
    },
    userProfile: undefined,
  },
  jwt: undefined,
  workspaceId: undefined,
  workspaceRole: 'member',
}

export const executeGraphQL = async (
  query: DocumentNode,
  options?: { variables?: Record<string, unknown>; user?: TestUser; workspaceId?: string },
): Promise<ExecutionResult> => {
  context = {
    ...context,
    session: { ...context.session, user: { ...context.session.user, ...(options?.user || context.session?.user) } },
    workspaceId: options?.workspaceId || context.workspaceId,
  }
  const result = await executor({
    document: query,
    ...options,
  })

  // Handle the case where result might be an async iterable (subscriptions)
  if (Symbol.asyncIterator in result) {
    throw new Error('Subscriptions are not supported in testing utility')
  }

  return result as ExecutionResult
}

export { parse as graphql } from 'graphql'
