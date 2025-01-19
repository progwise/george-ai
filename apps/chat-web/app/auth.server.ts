import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { graphql } from './gql'
import request from 'graphql-request'
import {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  BACKEND_GRAPHQL_URL,
} from './constants'

export const getKeycloakConfig = createServerFn({ method: 'GET' }).handler(
  () => {
    return {
      KEYCLOAK_URL,
      KEYCLOAK_REALM,
      KEYCLOAK_CLIENT_ID,
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

export const getUserInformation = createServerFn({ method: 'POST' })
  .validator((data) => {
    return z.string().nonempty().parse(data)
  })
  .handler(async (ctx) => {
    return await request(BACKEND_GRAPHQL_URL, loginDocument, {
      jwtToken: ctx.data,
    })
  })
