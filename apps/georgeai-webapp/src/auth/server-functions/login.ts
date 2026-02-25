import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getRequest, setCookie } from '@tanstack/react-start/server'
import z from 'zod'

import { logger } from '../../common'
import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'
import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../common'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { token?: string }) => z.object({ token: z.string().optional() }).parse(data))
  .handler(async ({ data: { token } }) => {
    logger.info('loginFn called', { tokenProvided: !!token })
    if (!token) {
      return deleteCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
    }

    const request = getRequest()
    const url = new URL(request?.url || '')
    const hostname = url.hostname

    // Check if hostname is an IP address (IPv4 pattern)
    const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)

    if (isIpAddress || hostname === 'localhost' || !hostname.includes('.')) {
      // For IP addresses, localhost, or simple hostnames, don't set domain (use default)
      setCookie(KEYCLOAK_TOKEN_COOKIE_NAME, token)
    } else {
      // For domains, extract parent domain for cross-subdomain sharing
      const hostParts = hostname.split('.').slice(1)
      if (hostParts.length > 0) {
        setCookie(KEYCLOAK_TOKEN_COOKIE_NAME, token, { domain: '.' + hostParts.join('.') })
      } else {
        setCookie(KEYCLOAK_TOKEN_COOKIE_NAME, token)
      }
    }

    const result = await backendRequest(
      graphql(`
        mutation login($jwtToken: String!) {
          login(jwtToken: $jwtToken) {
            userId
            avatarUrl
          }
        }
      `),
      {
        jwtToken: token,
      },
    )

    return result.login
  })
