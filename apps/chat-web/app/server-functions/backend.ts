import request, { RequestDocument, Variables } from 'graphql-request'
import { BACKEND_URL, GRAPHQL_API_KEY } from '../constants'
import { createServerFn } from '@tanstack/react-start'
import { graphql } from '../gql'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'

async function backendRequest<T, V extends Variables = Variables>(
  document: RequestDocument | TypedDocumentNode<T, V>,
  variables?: Variables,
): Promise<T> {
  return request(BACKEND_URL + '/graphql', document, variables, {
    Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
  })
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

const introspectionQueryDocument = graphql(/* GraphQL */ `
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

export const getBackendUrl = createServerFn({ type: 'static' }).handler(() => {
  return BACKEND_URL
})
