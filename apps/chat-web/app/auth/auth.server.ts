import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from '../constants'
import { graphql } from '../gql'
import { backendRequest } from '../server-functions/backend'

export const getKeycloakConfig = createServerFn({ method: 'GET' }).handler(
  () => {
    const keycloakConfig = {
      url: KEYCLOAK_URL!,
      realm: KEYCLOAK_REALM!,
      clientId: KEYCLOAK_CLIENT_ID!,
    }
    if (
      !keycloakConfig.url ||
      !keycloakConfig.realm ||
      !keycloakConfig.clientId
    ) {
      throw new Error(
        'Keycloak config is not complete: ' + JSON.stringify(keycloakConfig),
      )
    }
    return keycloakConfig
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
  .validator((data: string) => {
    return z.string().nonempty().parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(loginDocument, {
      jwtToken: ctx.data,
    })
  })
