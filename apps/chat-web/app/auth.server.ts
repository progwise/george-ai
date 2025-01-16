import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { graphql } from './gql'
import request from 'graphql-request'
import { LoginMutation } from './gql/graphql'

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const KEYCLOAK_URL = process.env.KEYCLOAK_URL
const BACKEND_GRAPHQL_URL = process.env.BACKEND_GRAPHQL_URL || ''

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
      email
      name
      given_name
      family_name
    }
  }
`)

export const getUserInformation = createServerFn({ method: 'POST' })
  .validator((data) => {
    console.log('validating', data)
    return z.string().nonempty().safeParse(data)
  })
  .handler(async (ctx) => {
    console.log('request backend', BACKEND_GRAPHQL_URL)
    console.log('request token', ctx.data)
    return await request<LoginMutation>(BACKEND_GRAPHQL_URL, loginDocument, {
      jwtToken: ctx.data.data,
    })
  })
