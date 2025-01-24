import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { graphql } from '../gql'
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '../constants'
import { backendRequest } from '../server-functions/backend'

export const getKeycloakConfig = createServerFn({ method: 'GET' }).handler(
  () => {
    return {
      url: KEYCLOAK_URL!,
      realm: KEYCLOAK_REALM!,
      clientId: KEYCLOAK_CLIENT_ID!,
    }
  },
)

const loginDocument = graphql(/* GraphQL */ `
  mutation login($jwtToken: String!) {
    login(jwtToken: $jwtToken) {
      id
      username
      email
      name
      given_name
      family_name
      createdAt
    }
  }
`)

export const ensureBackendUser = createServerFn({ method: 'POST' })
  .validator((data) => {
    return z.string().nonempty().parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(loginDocument, {
      jwtToken: ctx.data,
    })
  })
