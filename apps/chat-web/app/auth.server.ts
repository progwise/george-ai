import { createServerFn } from '@tanstack/start'
import { z } from 'zod'

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET
const KEYCLOAK_URL = process.env.KEYCLOAK_URL

export const getKeycloakConfig = createServerFn({ method: 'GET' }).handler(
  () => {
    return {
      KEYCLOAK_URL,
      KEYCLOAK_REALM,
      KEYCLOAK_CLIENT_ID,
    }
  },
)

export const getKeycloakLoginUrl = createServerFn({
  method: 'GET',
}).handler(() => {
  return `${KEYCLOAK_URL}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=http://localhost:3000&response_type=code&scope=openid`
})

export type KeycloakAccessToken = {
  access_token?: string
  token_type?: string
  error?: string
}

export const getKeycloakAccessToken = createServerFn({
  method: 'POST',
})
  .validator((access_code: string) => z.string().nonempty().parse(access_code))
  .handler(async (context) => {
    const params = `client_id=${KEYCLOAK_CLIENT_ID}&client_secret=${encodeURIComponent(KEYCLOAK_CLIENT_SECRET || '')}&code=${encodeURIComponent(context.data)}&redirect_uri=${encodeURIComponent('http://localhost:3000')}&grant_type=authorization_code&scope=openid`
    const data = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }).then(async (response) => {
      if (response.ok) {
        return response.json()
      }
      const t = await response.text()
      console.log('error getting token', t)
      return { error: response.statusText }
    })
    return {
      ...data,
      token_type: data.token_type.toUpperCase(),
    } as KeycloakAccessToken
  })

export const getKeycloakUserData = createServerFn({
  method: 'POST',
})
  .validator((data: unknown) =>
    z
      .object({
        access_token: z.string().nonempty(),
        token_type: z.enum(['BEARER']),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    console.log('data', data)
    const user_data = await fetch(
      `${KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: data.token_type + ' ' + data.access_token,
          Accept: 'application/json',
        },
      },
    ).then(async (response) => {
      if (response.ok) {
        return response.json()
      }
      const t = await response.text()
      console.log('error getting user information', t)
      return { error: response.statusText }
    })
    console.log(user_data)
    return user_data
  })
