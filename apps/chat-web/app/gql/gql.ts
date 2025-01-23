/* eslint-disable */
import * as types from './graphql'
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n':
    types.LoginDocument,
  '\n  mutation deleteAiAssistant($id: String!) {\n    deleteAiAssistant(assistantId: $id) {\n      id\n    }\n  }\n':
    types.DeleteAiAssistantDocument,
  '\n  query aiAssistantEdit($id: String!) {\n    aiAssistant(id: $id) {\n      id\n      name\n      description\n      icon\n      createdAt\n      ownerId\n      aiAssistantType\n      url\n    }\n  }\n':
    types.AiAssistantEditDocument,
  '\n  mutation changeAiAssistant($id: String!, $data: AiAssistantInput!) {\n    updateAiAssistant(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n':
    types.ChangeAiAssistantDocument,
  '\n  query aiAssistantCards($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      id\n      name\n      description\n      icon\n      aiAssistantType\n      createdAt\n      ownerId\n    }\n  }\n':
    types.AiAssistantCardsDocument,
  '\n  mutation createAiAssistant($ownerId: String!, $data: AiAssistantInput!) {\n    createAiAssistant(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n':
    types.CreateAiAssistantDocument,
  '\n  query aiKnowledgeSources($ownerId: String!) {\n    aiKnowledgeSources(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n':
    types.AiKnowledgeSourcesDocument,
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.IntrospectionQueryDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n',
): (typeof documents)['\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteAiAssistant($id: String!) {\n    deleteAiAssistant(assistantId: $id) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation deleteAiAssistant($id: String!) {\n    deleteAiAssistant(assistantId: $id) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiAssistantEdit($id: String!) {\n    aiAssistant(id: $id) {\n      id\n      name\n      description\n      icon\n      createdAt\n      ownerId\n      aiAssistantType\n      url\n    }\n  }\n',
): (typeof documents)['\n  query aiAssistantEdit($id: String!) {\n    aiAssistant(id: $id) {\n      id\n      name\n      description\n      icon\n      createdAt\n      ownerId\n      aiAssistantType\n      url\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeAiAssistant($id: String!, $data: AiAssistantInput!) {\n    updateAiAssistant(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  mutation changeAiAssistant($id: String!, $data: AiAssistantInput!) {\n    updateAiAssistant(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiAssistantCards($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      id\n      name\n      description\n      icon\n      aiAssistantType\n      createdAt\n      ownerId\n    }\n  }\n',
): (typeof documents)['\n  query aiAssistantCards($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      id\n      name\n      description\n      icon\n      aiAssistantType\n      createdAt\n      ownerId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createAiAssistant($ownerId: String!, $data: AiAssistantInput!) {\n    createAiAssistant(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  mutation createAiAssistant($ownerId: String!, $data: AiAssistantInput!) {\n    createAiAssistant(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiKnowledgeSources($ownerId: String!) {\n    aiKnowledgeSources(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  query aiKnowledgeSources($ownerId: String!) {\n    aiKnowledgeSources(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
