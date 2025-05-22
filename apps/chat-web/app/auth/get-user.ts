import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { queryKeys } from '../query-keys'
import { KEYCLOAK_TOKEN_COOKIE_NAME } from './auth'
import { ensureBackendUser } from './auth.server'

const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
  if (!token) {
    return null
  }

  const { login: user } = await ensureBackendUser({ data: token })

  return user
})

export const getUserQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.User],
    queryFn: () => getUser(),
    staleTime: Infinity,
  })
