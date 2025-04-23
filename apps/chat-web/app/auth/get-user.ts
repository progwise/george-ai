import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { KEYCLOAK_TOKEN_COOKIE_NAME } from './auth'
import { ensureBackendUser } from './auth.server'

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
  if (!token) {
    return null
  }

  const { login: user } = await ensureBackendUser({ data: token })

  return user
})
