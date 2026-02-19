import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../common'

const getUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const jwtToken = getCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
  if (!jwtToken) {
    return null
  }

  const result = await await backendRequest(
    graphql(`
      mutation login($jwtToken: String!) {
        login(jwtToken: $jwtToken) {
          ...User
        }
      }
    `),
    {
      jwtToken,
    },
  )

  return result.login
})

export const getUserQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.User],
    queryFn: () => getUserFn(),
    staleTime: Infinity,
  })
