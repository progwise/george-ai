import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import request, { RequestDocument, Variables } from 'graphql-request'

import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../auth/auth'
import { BACKEND_PUBLIC_URL, BACKEND_URL, GRAPHQL_API_KEY } from '../constants'
import { graphql } from '../gql'

async function backendRequest<T, V extends Variables = Variables>(
  document: RequestDocument | TypedDocumentNode<T, V>,
  variables?: Variables,
  opts?: { jwtToken?: string },
): Promise<T> {
  // Get the JWT token from opts or from the cookie (if available)
  const jwtToken = opts?.jwtToken ?? getCookie?.(KEYCLOAK_TOKEN_COOKIE_NAME)
  const headers: Record<string, string> = {
    Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
  }
  if (jwtToken) {
    // Optionally include user JWT for user-specific requests
    headers['x-user-jwt'] = jwtToken
  }
  return request(BACKEND_URL + '/graphql', document, variables, headers)
}

async function backendUpload(content: Blob, fileId: string) {
  const data = await content.arrayBuffer()
  const buffer = Buffer.from(data)
  return fetch(BACKEND_URL + '/upload', {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
      'x-upload-token': fileId,
    },
    body: buffer,
  })
}

export { backendRequest, backendUpload }

const introspectionQueryDocument = graphql(`
  query IntrospectionQuery {
    __schema {
      description
      queryType {
        name
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }
  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }
  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }
  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`)

export const getBackendGraphQLSchema = createServerFn({
  method: 'GET',
}).handler(() => {
  return backendRequest(introspectionQueryDocument)
})

export const getBackendPublicUrl = createServerFn({ method: 'GET' }).handler(() => {
  return BACKEND_PUBLIC_URL
})
