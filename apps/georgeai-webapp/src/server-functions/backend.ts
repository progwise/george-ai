import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import request, { RequestDocument, Variables } from 'graphql-request'

import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../auth/auth'
import { BACKEND_URL, GRAPHQL_API_KEY } from '../constants'
import { graphql } from '../gql'
import { WORKSPACE_COOKIE_NAME } from './workspace-cookie'

async function backendRequest<T, V extends Variables = Variables>(
  document: RequestDocument | TypedDocumentNode<T, V>,
  variables?: Variables,
): Promise<T> {
  // Get the JWT token and workspace ID from cookies
  const jwtToken = getCookie?.(KEYCLOAK_TOKEN_COOKIE_NAME)
  const workspaceId = getCookie?.(WORKSPACE_COOKIE_NAME)
  const headers: Record<string, string> = {
    Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
  }
  if (jwtToken) {
    // Optionally include user JWT for user-specific requests
    headers['x-user-jwt'] = jwtToken
  }
  if (workspaceId) {
    // Include workspace ID for workspace-scoped requests
    headers['x-workspace-id'] = workspaceId
  }

  try {
    return await request(BACKEND_URL + '/graphql', document, variables, headers)
  } catch (error) {
    // Extract clean GraphQL error messages from response.errors
    if (error && typeof error === 'object' && 'response' in error) {
      const response = error.response as { errors?: Array<{ message: string }> }
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map((e) => e.message).join('\n')
        throw new Error(errorMessages)
      }
    }
    // Re-throw original error if it's not a GraphQL error
    throw error
  }
}

async function backendUpload(content: Blob, fileId: string) {
  const jwtToken = getCookie?.(KEYCLOAK_TOKEN_COOKIE_NAME)
  if (!jwtToken) {
    throw new Error('User token not found in cookies')
  }
  const data = await content.arrayBuffer()
  const buffer = Buffer.from(data)
  return fetch(BACKEND_URL + '/upload', {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
      'x-upload-token': fileId,
      'x-user-jwt': jwtToken,
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
