import { createServerFn } from '@tanstack/react-start'
import { deleteCookie } from '@tanstack/react-start/server'

import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../common'

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
})
